"""
Utility functions to reduce code duplication
"""

from functools import wraps
from typing import Any, Callable, Optional


def definition_proxy_property(field_name: str, default: Any = None):
    """
    Decorator factory to create proxy properties that access ItemDefinition fields
    Reduces code duplication in Item model
    """
    def decorator(method: Callable) -> property:
        @wraps(method)
        def wrapper(self):
            d = self._get_definition()
            if d:
                return getattr(d, field_name) if hasattr(d, field_name) else default
            return default
        return property(wrapper)
    return decorator


def safe_get_nested(data: dict, keys: list, default: Any = None) -> Any:
    """
    Safely get nested dictionary values
    Example: safe_get_nested(data, ['Data', 'UID'], '')
    """
    current = data
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return default
    return current


def create_item_definition_safe(item_id: str, name: str, rarity: str = "Common") -> 'ItemDefinition':
    """
    Create ItemDefinition with proper validation
    """
    from Backend.PlayerData.models.Item import ItemDefinition
    
    if not item_id or not item_id.strip():
        raise ValueError("Item ID cannot be empty")
    
    if not name or not name.strip():
        raise ValueError("Item name cannot be empty")
    
    return ItemDefinition(
        item_id=item_id.strip(),
        name=name.strip(),
        rarity=rarity.strip() if rarity else "Common"
    )
