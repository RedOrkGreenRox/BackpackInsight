from functools import lru_cache
from typing import List, Tuple, Set, Union, Optional
from sqlmodel import Session, select, col, or_
from deep_translator import GoogleTranslator
from Backend.PlayerData.models.Item import ItemDefinition, Item

def generate_trigrams(text: str) -> Set[str]:
    """
    Splits text into 3-character chunks (trigrams).
    Example: "Sword" -> {" swo", "swo", "wor", "ord", "rd "}
    Includes padding spaces to handle short words and boundaries.
    """
    if not text:
        return set()
    
    # Add padding to give weight to the start and end of the word
    padded = f" {text.lower()} "
    
    if len(padded) < 3:
        return {padded}
        
    return {padded[i:i+3] for i in range(len(padded) - 2)}

def calculate_similarity(query: str, target: str) -> float:
    """
    Calculates similarity score (0.0 to 1.0) using Sørensen–Dice coefficient on trigrams.
    """
    if not query or not target:
        return 0.0
    
    # Exact match shortcut
    if query.lower() == target.lower():
        return 1.0
        
    q_grams = generate_trigrams(query)
    t_grams = generate_trigrams(target)
    
    if not q_grams or not t_grams:
        return 0.0
        
    intersection = len(q_grams & t_grams)
    total = len(q_grams) + len(t_grams)
    
    return (2.0 * intersection) / total

@lru_cache(maxsize=1000)
def _cached_translate(text: str) -> str:
    """
    Internal cached function for translation.
    """
    try:
        translated = GoogleTranslator(source='auto', target='en').translate(text)
        print(f"--- Search: Translated '{text}' -> '{translated}' (API Call) ---")
        return translated
    except Exception as e:
        print(f"--- Search Warning: Translation failed: {e}")
        return text

def translate_query(query: str) -> str:
    """
    Translates non-English queries to English using Google Translate.
    Uses LRU cache to avoid repeated API calls.
    """
    # Simple check: if query contains non-ASCII characters, try to translate
    if not query.isascii():
        return _cached_translate(query)
    return query

def search_items(
    session: Session, 
    query: str, 
    threshold: float = 0.3, 
    limit: int = 10,
    scope: Optional[List[str]] = None
) -> List[Tuple[Union[ItemDefinition, Item], float, str]]:
    """
    Searches for items in ItemDefinition (Static) and Item (Dynamic) tables.
    Optimized to use Database-side filtering (ILIKE) instead of loading all objects.
    Supports automatic translation to English.
    
    :param session: The database session to use for queries.
    :param query: The search string to match against item names.
    :param threshold: The minimum similarity score (0.0 to 1.0) required for a match.
    :param limit: The maximum number of results to return.
    :param scope: List of categories to search in. Options: ["static", "dynamic"]. 
                  If None, searches everywhere.
    :return: List of tuples: (Object, Score, Type).
    """
    if scope is None:
        scope = ["static", "dynamic"]
        
    # Translate query if needed
    original_query = query
    query = translate_query(query)

    results = []
    # Prepare pattern for SQL ILIKE (contains)
    search_pattern = f"%{query}%"
    
    # 1. Search Static Definitions
    if "static" in scope:
        # Filter in DB: Name contains query OR ID contains query
        statement = select(ItemDefinition).where(
            or_(
                col(ItemDefinition.name).ilike(search_pattern),
                col(ItemDefinition.item_id).ilike(search_pattern)
            )
        )
        # Limit fetch to avoid pulling too many rows if query is generic (e.g. "a")
        # We fetch a bit more than limit to allow Python scoring to re-sort
        definitions = session.exec(statement.limit(limit * 5)).all()
        
        for definition in definitions:
            score = calculate_similarity(query, definition.name)
            # Boost exact ID match
            if query.lower() == definition.item_id.lower():
                score = 1.0
                
            if score >= threshold:
                results.append((definition, score, "Static Definition"))
            
    # 2. Search Dynamic Items (Inventory)
    if "dynamic" in scope:
        # Join with ItemDefinition to search by Name
        statement = select(Item).join(ItemDefinition).where(
            or_(
                col(ItemDefinition.name).ilike(search_pattern),
                col(ItemDefinition.item_id).ilike(search_pattern)
            )
        )
        items = session.exec(statement.limit(limit * 5)).all()
        
        for item in items:
            name = item.name 
            score = calculate_similarity(query, name)
            
            if query.lower() == item.item_id.lower():
                score = 1.0
                
            if score >= threshold:
                results.append((item, score, f"Player Item (Lv.{item.level})"))

    # Sort by score descending
    results.sort(key=lambda x: x[1], reverse=True)
    
    return results[:limit]
