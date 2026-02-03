from Item import Item
from Hero import Hero
from data import PROFILE_EXP_NEED, PROFILE_AREAS

class Profile:
    def __init__(self, profile):
        self.technical_information = {
            "Data": profile["Data"],
            "AV": profile["Data"]["AV"],
            "BN": profile["BN"],
            "GR": profile["GR"],
            "BT": profile["BT"],
            "UID": profile["UID"],
            "DUID": profile["DUID"],
            "FBID": profile["FBID"],
            "SafeArea": profile["SafeArea"],
            "Screen": profile["Screen"],
            "Device": profile["Device"],
            "SMS": profile["SMS"],
            "SSMS": profile["SSMS"],
            "Mem": profile["Mem"],
            "OS": profile["OS"],
            "NTP1": profile["NTP1"],
            "NTP2": profile["NTP2"],
            "NTPA": profile["NTPA"],
            "DTU": profile["DTU"],
            "DT": profile["DT"],
            "AS": profile["AS"],
            "ELUID": profile["ELUID"],
            "EPUID": profile["EPUID"],
            "IV": profile["IV"],
            "LV": profile["LV"],
            "VH": profile["VH"],
            "IBA": profile["IBA"],
            "AB": profile["AB"],
            "CS": profile["CS"],
            "RSM": profile["RSM"],
        }
        self.game_information = {
            "Nickname": profile["Name"],
            "PH": profile["PH"].split(","),
            "Currency": profile["Currency"],
            "UL": profile["UL"],
            "Trophy": profile["Trophy"],
            "BonusTrophy": profile["BonusTrophy"],
            "Area": None,
            "Hero": [Hero([name] + info.split(":")) for name, info in profile["Hero"].items()],
            "Item": [Item([name] + info.split(':')) for name, info in profile["Item"].items()],
            "ItemStats": {},
            "PlayerLevel": None,
            "PlayerExperienceTotal": None,
            "PlayerExperienceCurrent": None,
            "Skins": {},
            "Banners": [],
        }
        self.get_experience()
        self.get_level()
        self.get_experience_need()
        self.get_area()
        self.get_skins()
        self.get_banners()
        self.get_items()

    def __str__(self):
        return f"""
        Nickname: {self.game_information["Nickname"]}
        Level: {self.game_information["PlayerLevel"]} ({self.game_information["PlayerExperienceCurrent"]}/{self.game_information["PlayerExperienceNeed"]})
        Total XP: {self.game_information["PlayerExperienceTotal"]}
        Trophies: {self.game_information["Trophy"]} + {self.game_information["BonusTrophy"]}
        Area: {self.game_information["Area"]}
        Coins: {self.game_information["Currency"]["coins"]}
        Gems: {self.game_information["Currency"]["gems"]}
        """

    def get_items(self):
        for item in self.game_information["Item"]:
            if item.rarity is None:
                print(item)
            self.game_information["ItemStats"][item.rarity] = self.game_information["ItemStats"].get(item.rarity, 0) + 1

    def get_skins(self):
        for unlock in self.game_information["UL"]:
            if "Skin" in unlock:
                character = unlock.split("Skin")[0]
                skin = unlock.split("Skin")[1]
                self.game_information["Skins"][character] = self.game_information["Skins"].get(character, []) + [skin]

    def get_banners(self):
        for donation in self.game_information["UL"]:
            if "Banner" in donation:
                self.game_information["Banners"].append(donation.split("Banner")[0])

    def get_experience(self):
        result = 0
        for item in self.game_information["Item"]:
            if item.total_xp != -1:
                result += item.total_xp
        self.game_information["PlayerExperienceTotal"] = result

    def get_experience_need(self):
        if self.game_information["PlayerLevel"] >= 100:
            self.game_information["PlayerExperienceNeed"] = 100_000
            return
        self.game_information["PlayerExperienceNeed"] = PROFILE_EXP_NEED[self.game_information["PlayerLevel"] - 1]

    def get_level(self):
        xp = self.game_information["PlayerExperienceTotal"]
        lvl = 1
        for level in PROFILE_EXP_NEED:
            if xp >= level:
                lvl += 1
                xp -= level
            else:
                self.game_information["PlayerExperienceCurrent"] = xp
                self.game_information["PlayerLevel"] = lvl
                break
        else:
            lvl += xp // 100000
            xp %= 100000
            self.game_information["PlayerExperienceCurrent"] = xp
            self.game_information["PlayerLevel"] = lvl

    def get_area(self):
        trophy = (self.game_information["Trophy"] + self.game_information["BonusTrophy"])
        area = f"20"
        for area_req in PROFILE_AREAS:
            if trophy < area_req:
                area = f"{PROFILE_AREAS.index(area_req):02d}"
                break
        self.game_information["Area"] = area