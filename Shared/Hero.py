from data import HERO_LEVELING_EXP, HERO_LEAGUES, VALUES

class Hero:
    def __init__(self, hero):
        self.name = VALUES.get(hero[0], hero[0])
        self.level = int(hero[1]) + 1
        self.prestige = False
        if self.level > 20:
            self.level -= 20
            self.prestige = True
        self.experience = int(hero[2])
        self.exp_req = self.get_xp_required()
        self.rating = int(hero[3])
        self.league = HERO_LEAGUES[min(10, self.rating // 500)]

    def __str__(self):
        return f"""
        Name: {self.name} 
        Lv. {self.level} {"Prestige" if self.prestige else ""}
        Experience: {self.experience}/{self.exp_req} 
        League: {self.league} ({self.rating - 500 * (self.rating // 500)})
            """

    def get_xp_required(self):
        # Берем опыт для следующего уровня (self.level + 1)
        next_level = self.level + 1
        
        if next_level <= 20:
            return HERO_LEVELING_EXP.get(next_level, 0)
        else:
            # Для уровней выше 20 (престиж) логика может отличаться,
            # но если формула линейная, то используем next_level
            calculated_xp = 1000 + 100 * (next_level - 21)
            return min(calculated_xp, 3000)
