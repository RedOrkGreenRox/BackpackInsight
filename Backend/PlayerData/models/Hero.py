from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from Backend.PlayerData.data import HERO_LEVELING_EXP, HERO_LEAGUES, VALUES

if TYPE_CHECKING:
    from Backend.PlayerData.models.Profile import Profile

class Hero(SQLModel, table=True):
    # -- Database Primary Key --
    pk: Optional[int] = Field(default=None, primary_key=True)
    
    # -- Foreign Key --
    profile_id: Optional[int] = Field(default=None, foreign_key="profile.pk")
    
    # -- Relationships --
    profile: Optional["Profile"] = Relationship(back_populates="heroes")

    # -- Fields --
    name: str = Field(index=True) # Indexed for faster search
    level: int
    experience: int
    rating: int = Field(index=True) # Indexed for leaderboards
    prestige: bool = Field(default=False)
    league: str = Field(default="Bronze")

    # -- Factory Method for Parsing --
    @classmethod
    def from_entry(cls, entry: List[str]) -> "Hero":
        """
        Parses a hero entry list from the profile JSON.
        Format: [RawName, Level-1, Experience, Rating]
        Example: ["Barbarian", "5", "150", "1200"]
        """
        if not entry or len(entry) < 4:
            # Fallback for empty or malformed data
            return cls(name="Unknown", level=1, experience=0, rating=0)

        _raw_name = entry[0]
        _name = VALUES.get(_raw_name, _raw_name)
        
        # Level in JSON is 0-based (0 = Level 1)
        _level = int(entry[1]) + 1
        _experience = int(entry[2])
        _rating = int(entry[3])
        
        _prestige = False
        
        # Prestige Logic
        if _level > 20:
            _level -= 20
            _prestige = True
            
        # League Logic
        _league_idx = min(10, _rating // 500)
        _league = HERO_LEAGUES[_league_idx] if _league_idx < len(HERO_LEAGUES) else "Unknown"

        return cls(
            name=_name,
            level=_level,
            experience=_experience,
            rating=_rating,
            prestige=_prestige,
            league=_league
        )

    @property
    def exp_req(self) -> int:
        """Calculates experience required for the next level."""
        next_level = self.level + 1
        
        if next_level <= 20:
            return HERO_LEVELING_EXP.get(next_level, 0)
        else:
            # Linear progression after level 20
            calculated_xp = 1000 + 100 * (next_level - 21)
            return min(calculated_xp, 3000)

    def __str__(self):
        prestige_icon = "✨" if self.prestige else ""
        prestige_text = " (Prestige)" if self.prestige else ""
        
        # Calculate progress bar for XP
        xp_percent = 0
        if self.exp_req > 0:
            xp_percent = min(100, int((self.experience / self.exp_req) * 100))
        
        # Simple progress bar
        bar_len = 10
        filled_len = int(bar_len * xp_percent / 100)
        bar = "█" * filled_len + "░" * (bar_len - filled_len)

        rating_progress = self.rating - 500 * (self.rating // 500)

        return (
            f"{self.name} {prestige_icon}\n"
            f"Level: {self.level}{prestige_text}\n"
            f"XP:    {self.experience}/{self.exp_req} [{bar}] {xp_percent}%\n"
            f"League: {self.league} ({self.rating} rating, +{rating_progress} in tier)\n"
            f"   " + "-"*30
        )
