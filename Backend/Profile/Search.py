from typing import List, Tuple, Set, Union, Optional
from sqlmodel import Session, select
from Item import ItemDefinition, Item

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

def search_items(
    session: Session, 
    query: str, 
    threshold: float = 0.3, 
    limit: int = 10,
    scope: Optional[List[str]] = None
) -> List[Tuple[Union[ItemDefinition, Item], float, str]]:
    """
    Searches for items in ItemDefinition (Static) and Item (Dynamic) tables.
    
    :param scope: List of categories to search in. Options: ["static", "dynamic"]. 
                  If None, searches everywhere.
    :return: List of tuples: (Object, Score, Type).
    """
    if scope is None:
        scope = ["static", "dynamic"]
        
    results = []
    
    # 1. Search Static Definitions
    if "static" in scope:
        definitions = session.exec(select(ItemDefinition)).all()
        for definition in definitions:
            score = calculate_similarity(query, definition.name)
            if score >= threshold:
                results.append((definition, score, "Static Definition"))
            
    # 2. Search Dynamic Items (Inventory)
    if "dynamic" in scope:
        items = session.exec(select(Item)).all()
        for item in items:
            # Use item.name (which proxies to definition.name)
            name = item.name 
            score = calculate_similarity(query, name)
            
            # Boost score slightly if it's an exact match on ID
            if query == item.item_id:
                score = 1.0
                
            if score >= threshold:
                results.append((item, score, f"Player Item (Lv.{item.level})"))

    # Sort by score descending
    results.sort(key=lambda x: x[1], reverse=True)
    
    return results[:limit]
