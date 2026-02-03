from data import json
from Profile import Profile

file_path = '../Profiles/Marat.json'
with open(file_path, 'r', encoding='utf-8') as f:

    file = json.loads(f.read())
    # for key, value in file.items():
    #     print(key, value)

    profile = Profile(file)
    print(profile)
    # print(profile.technical_information["AV"])
    # print(profile.game_information["Skins"])
    # print(profile.game_information["Banners"])