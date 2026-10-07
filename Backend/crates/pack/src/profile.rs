use crate::generated::profile_generated::backpack_insight::profile::{
    finish_profile_view_buffer, root_as_profile_view, HeroView, HeroViewArgs, ItemStat,
    ItemStatArgs, ItemView, ItemViewArgs, ProfileView, ProfileViewArgs, SkinList, SkinListArgs,
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProfileHeroPack {
    pub name: String,
    pub level: u32,
    pub rating: u32,
    pub experience: u64,
    pub exp_req: u64,
    pub prestige: bool,
    pub league: String,
    pub skin_num: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProfileItemPack {
    pub name: String,
    pub rarity: String,
    pub level: u32,
    pub cards: u32,
    pub cards_need: i32,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProfileViewPack {
    pub nickname: String,
    pub level: u64,
    pub trophy: u64,
    pub bonus_trophy: u64,
    pub gems: u64,
    pub coins: u64,
    pub xp_current: u64,
    pub xp_need: u64,
    pub area: String,
    pub item_stats: Vec<(String, u64)>,
    pub heroes: Vec<ProfileHeroPack>,
    pub items: Vec<ProfileItemPack>,
    pub actual_version: Option<String>,
    pub install_version: Option<String>,
    pub profile_skins: Vec<(String, Vec<String>)>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProfileViewInfo {
    pub nickname: String,
    pub heroes_count: usize,
    pub items_count: usize,
    pub level: u64,
}

pub fn build_profile_view_bytes(profile: &ProfileViewPack) -> Vec<u8> {
    let mut fbb = flatbuffers::FlatBufferBuilder::new();

    let item_stats = build_item_stats(&mut fbb, &profile.item_stats);
    let heroes = build_heroes(&mut fbb, &profile.heroes);
    let items = build_items(&mut fbb, &profile.items);
    let profile_skins = build_profile_skins(&mut fbb, &profile.profile_skins);

    let nickname = fbb.create_string(&profile.nickname);
    let area = fbb.create_string(&profile.area);
    let actual_version = profile
        .actual_version
        .as_ref()
        .map(|value| fbb.create_string(value));
    let install_version = profile
        .install_version
        .as_ref()
        .map(|value| fbb.create_string(value));

    let root = ProfileView::create(
        &mut fbb,
        &ProfileViewArgs {
            nickname: Some(nickname),
            level: profile.level,
            trophy: profile.trophy,
            bonus_trophy: profile.bonus_trophy,
            gems: profile.gems,
            coins: profile.coins,
            xp_current: profile.xp_current,
            xp_need: profile.xp_need,
            area: Some(area),
            item_stats: Some(item_stats),
            heroes: Some(heroes),
            heroes_count: profile.heroes.len() as u32,
            items: Some(items),
            items_count: profile.items.len() as u32,
            actual_version,
            install_version,
            profile_skins: Some(profile_skins),
        },
    );
    finish_profile_view_buffer(&mut fbb, root);
    fbb.finished_data().to_vec()
}

pub fn read_profile_view_bytes(bytes: &[u8]) -> Result<ProfileViewPack, String> {
    let profile = root_as_profile_view(bytes).map_err(|err| err.to_string())?;
    Ok(profile_view_from_fb(profile))
}

pub fn read_profile_view_info_bytes(bytes: &[u8]) -> Result<ProfileViewInfo, String> {
    let profile = root_as_profile_view(bytes).map_err(|err| err.to_string())?;
    Ok(ProfileViewInfo {
        nickname: profile.nickname().to_string(),
        heroes_count: profile.heroes().map(|items| items.len()).unwrap_or(0),
        items_count: profile.items().map(|items| items.len()).unwrap_or(0),
        level: profile.level(),
    })
}

fn profile_view_from_fb(profile: ProfileView<'_>) -> ProfileViewPack {
    ProfileViewPack {
        nickname: profile.nickname().to_string(),
        level: profile.level(),
        trophy: profile.trophy(),
        bonus_trophy: profile.bonus_trophy(),
        gems: profile.gems(),
        coins: profile.coins(),
        xp_current: profile.xp_current(),
        xp_need: profile.xp_need(),
        area: profile.area().map(str::to_string).unwrap_or_default(),
        item_stats: profile
            .item_stats()
            .map(|items| {
                items
                    .iter()
                    .map(|item| (item.rarity().to_string(), item.count()))
                    .collect()
            })
            .unwrap_or_default(),
        heroes: profile
            .heroes()
            .map(|items| {
                items
                    .iter()
                    .map(|hero| ProfileHeroPack {
                        name: hero.name().to_string(),
                        level: hero.level(),
                        rating: hero.rating(),
                        experience: hero.experience(),
                        exp_req: hero.exp_req(),
                        prestige: hero.prestige(),
                        league: hero.league().map(str::to_string).unwrap_or_default(),
                        skin_num: hero.skin_num().map(str::to_string).unwrap_or_default(),
                    })
                    .collect()
            })
            .unwrap_or_default(),
        items: profile
            .items()
            .map(|items| {
                items
                    .iter()
                    .map(|item| ProfileItemPack {
                        name: item.name().to_string(),
                        rarity: item.rarity().map(str::to_string).unwrap_or_default(),
                        level: item.level(),
                        cards: item.cards(),
                        cards_need: item.cards_need(),
                    })
                    .collect()
            })
            .unwrap_or_default(),
        actual_version: profile.actual_version().map(str::to_string),
        install_version: profile.install_version().map(str::to_string),
        profile_skins: profile
            .profile_skins()
            .map(|items| {
                items
                    .iter()
                    .map(|skin| {
                        (
                            skin.owner().to_string(),
                            skin.skins().iter().map(str::to_string).collect(),
                        )
                    })
                    .collect()
            })
            .unwrap_or_default(),
    }
}

fn build_item_stats<'a>(
    fbb: &mut flatbuffers::FlatBufferBuilder<'a>,
    stats: &[(String, u64)],
) -> flatbuffers::WIPOffset<flatbuffers::Vector<'a, flatbuffers::ForwardsUOffset<ItemStat<'a>>>> {
    let offsets = stats
        .iter()
        .map(|(rarity, count)| {
            let rarity = fbb.create_string(rarity);
            ItemStat::create(
                fbb,
                &ItemStatArgs {
                    rarity: Some(rarity),
                    count: *count,
                },
            )
        })
        .collect::<Vec<_>>();
    fbb.create_vector(&offsets)
}

fn build_heroes<'a>(
    fbb: &mut flatbuffers::FlatBufferBuilder<'a>,
    heroes: &[ProfileHeroPack],
) -> flatbuffers::WIPOffset<flatbuffers::Vector<'a, flatbuffers::ForwardsUOffset<HeroView<'a>>>> {
    let offsets = heroes
        .iter()
        .map(|hero| {
            let name = fbb.create_string(&hero.name);
            let league = fbb.create_string(&hero.league);
            let skin_num = fbb.create_string(&hero.skin_num);
            HeroView::create(
                fbb,
                &HeroViewArgs {
                    name: Some(name),
                    level: hero.level,
                    rating: hero.rating,
                    experience: hero.experience,
                    exp_req: hero.exp_req,
                    prestige: hero.prestige,
                    league: Some(league),
                    skin_num: Some(skin_num),
                },
            )
        })
        .collect::<Vec<_>>();
    fbb.create_vector(&offsets)
}

fn build_items<'a>(
    fbb: &mut flatbuffers::FlatBufferBuilder<'a>,
    items: &[ProfileItemPack],
) -> flatbuffers::WIPOffset<flatbuffers::Vector<'a, flatbuffers::ForwardsUOffset<ItemView<'a>>>> {
    let offsets = items
        .iter()
        .map(|item| {
            let name = fbb.create_string(&item.name);
            let rarity = fbb.create_string(&item.rarity);
            ItemView::create(
                fbb,
                &ItemViewArgs {
                    name: Some(name),
                    rarity: Some(rarity),
                    level: item.level,
                    cards: item.cards,
                    cards_need: item.cards_need,
                },
            )
        })
        .collect::<Vec<_>>();
    fbb.create_vector(&offsets)
}

fn build_profile_skins<'a>(
    fbb: &mut flatbuffers::FlatBufferBuilder<'a>,
    skins: &[(String, Vec<String>)],
) -> flatbuffers::WIPOffset<flatbuffers::Vector<'a, flatbuffers::ForwardsUOffset<SkinList<'a>>>> {
    let offsets = skins
        .iter()
        .map(|(owner, values)| {
            let owner = fbb.create_string(owner);
            let skin_offsets = values
                .iter()
                .map(|skin| fbb.create_string(skin))
                .collect::<Vec<_>>();
            let skins = fbb.create_vector(&skin_offsets);
            SkinList::create(
                fbb,
                &SkinListArgs {
                    owner: Some(owner),
                    skins: Some(skins),
                },
            )
        })
        .collect::<Vec<_>>();
    fbb.create_vector(&offsets)
}

#[cfg(test)]
mod tests {
    use super::{
        build_profile_view_bytes, read_profile_view_bytes, read_profile_view_info_bytes,
        ProfileHeroPack, ProfileItemPack, ProfileViewPack,
    };

    #[test]
    fn builds_and_reads_profile_view() {
        let bytes = build_profile_view_bytes(&ProfileViewPack {
            nickname: "Player".to_string(),
            level: 2,
            trophy: 100,
            bonus_trophy: 5,
            gems: 10,
            coins: 20,
            xp_current: 40,
            xp_need: 280,
            area: "04".to_string(),
            item_stats: vec![("Common".to_string(), 1)],
            heroes: vec![ProfileHeroPack {
                name: "Ronan".to_string(),
                level: 15,
                rating: 3000,
                experience: 1,
                exp_req: 2,
                prestige: false,
                league: "Diamond".to_string(),
                skin_num: "01".to_string(),
            }],
            items: vec![ProfileItemPack {
                name: "Wooden Sword".to_string(),
                rarity: "Common".to_string(),
                level: 6,
                cards: 200,
                cards_need: 100,
            }],
            actual_version: Some("5.0.0".to_string()),
            install_version: Some("1.0.0".to_string()),
            profile_skins: vec![("Ronan".to_string(), vec!["01".to_string()])],
        });
        let info =
            read_profile_view_info_bytes(&bytes).unwrap_or_else(|err| panic!("valid fb: {err}"));
        assert_eq!(info.nickname, "Player");
        assert_eq!(info.heroes_count, 1);
        assert_eq!(info.items_count, 1);
        assert_eq!(info.level, 2);

        let profile =
            read_profile_view_bytes(&bytes).unwrap_or_else(|err| panic!("valid fb: {err}"));
        assert_eq!(profile.nickname, "Player");
        assert_eq!(profile.heroes[0].name, "Ronan");
        assert_eq!(profile.items[0].name, "Wooden Sword");
        assert_eq!(profile.item_stats, [("Common".to_string(), 1)]);
        assert_eq!(
            profile.profile_skins,
            [("Ronan".to_string(), vec!["01".to_string()])]
        );
    }
}
