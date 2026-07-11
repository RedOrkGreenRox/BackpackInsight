use rbackend_core::{
    AreaService, BannerService, Cards, CatalogColumns, CatalogItemInput, HeroInput, HeroRating,
    HeroService, ItemIconService, ItemLevel, ItemLevelService, LevelService, ProfileCheckInput,
    ProfileCheckService, ProfileIdentityInput, ProfileIdentityService, ProfileScoreInput,
    ProfileScoreService, ProfileWalletInput, ProfileWalletService, RarityService, SkinService,
    SlugService, StringPool, UnlockService, Xp,
};
use serde_json::Value;
use std::{
    env, fs,
    path::{Path, PathBuf},
};

fn main() {
    let mut args = env::args().skip(1);
    let Some(command) = args.next() else {
        print_help();
        std::process::exit(2);
    };

    let result = match command.as_str() {
        "slug" => command_slug(args.collect()),
        "image-key" => command_image_key(args.collect()),
        "level" => command_level(args.collect()),
        "area" => command_area(args.collect()),
        "hero" => command_hero(args.collect()),
        "item-level" => command_item_level(args.collect()),
        "unlock" => command_unlock(args.collect()),
        "profile-check" => command_profile_check(args.collect()),
        "profile-id" => command_profile_id(args.collect()),
        "profile-wallet" => command_profile_wallet(args.collect()),
        "profile-score" => command_profile_score(args.collect()),
        "intern" => command_intern(args.collect()),
        "catalog-summary" => command_catalog_summary(args.collect()),
        "check-images" => command_check_images(args.collect()),
        "help" | "--help" | "-h" => {
            print_help();
            Ok(())
        }
        other => Err(format!("unknown command: {other}")),
    };

    if let Err(error) = result {
        eprintln!("{error}");
        std::process::exit(1);
    }
}

fn command_slug(parts: Vec<String>) -> Result<(), String> {
    let name = parts.join(" ");
    if name.trim().is_empty() {
        return Err("usage: cli slug <item name>".to_string());
    }
    println!("{}", SlugService::to_slug(name));
    Ok(())
}

fn command_image_key(parts: Vec<String>) -> Result<(), String> {
    let mut rarity: Option<String> = None;
    let mut tooltip: Option<String> = None;
    let mut name_parts = Vec::new();
    let mut index = 0;

    while index < parts.len() {
        match parts[index].as_str() {
            "--rarity" => {
                index += 1;
                rarity = Some(parts.get(index).ok_or("--rarity requires a value")?.clone());
            }
            "--tooltip" => {
                index += 1;
                tooltip = Some(
                    parts
                        .get(index)
                        .ok_or("--tooltip requires a value")?
                        .clone(),
                );
            }
            value => name_parts.push(value.to_string()),
        }
        index += 1;
    }

    let name = name_parts.join(" ");
    if name.trim().is_empty() {
        return Err("usage: cli image-key [--rarity R] [--tooltip T] <item name>".to_string());
    }

    println!(
        "{}",
        ItemIconService::image_key(name, rarity.as_deref(), tooltip.as_deref())
    );
    Ok(())
}

fn command_level(parts: Vec<String>) -> Result<(), String> {
    let mut total_xp: Option<u64> = None;
    let mut index = 0;

    while index < parts.len() {
        match parts[index].as_str() {
            "--xp" => {
                index += 1;
                total_xp = Some(parse_u64(parts.get(index), "--xp")?);
            }
            other => return Err(format!("unknown level argument: {other}")),
        }
        index += 1;
    }

    let total_xp = total_xp.ok_or("usage: cli level --xp <total xp>")?;
    let progress = LevelService::from_total_xp(Xp(total_xp));
    println!(
        "level={} current={} need={}",
        progress.level, progress.current, progress.need
    );
    Ok(())
}

fn command_area(parts: Vec<String>) -> Result<(), String> {
    let mut trophy: Option<u64> = None;
    let mut bonus = 0u64;
    let mut index = 0;

    while index < parts.len() {
        match parts[index].as_str() {
            "--trophy" => {
                index += 1;
                trophy = Some(parse_u64(parts.get(index), "--trophy")?);
            }
            "--bonus" => {
                index += 1;
                bonus = parse_u64(parts.get(index), "--bonus")?;
            }
            other => return Err(format!("unknown area argument: {other}")),
        }
        index += 1;
    }

    let trophy = trophy.ok_or("usage: cli area --trophy <trophy> [--bonus <bonus>]")?;
    println!("{}", AreaService::from_trophies(trophy, bonus));
    Ok(())
}

fn command_hero(parts: Vec<String>) -> Result<(), String> {
    let mut name: Option<String> = None;
    let mut raw_level: Option<u32> = None;
    let mut xp = 0u64;
    let mut rating: Option<u32> = None;
    let mut index = 0;

    while index < parts.len() {
        match parts[index].as_str() {
            "--name" => {
                index += 1;
                name = Some(parts.get(index).ok_or("--name requires a value")?.clone());
            }
            "--level-raw" => {
                index += 1;
                raw_level = Some(parse_u32(parts.get(index), "--level-raw")?);
            }
            "--xp" => {
                index += 1;
                xp = parse_u64(parts.get(index), "--xp")?;
            }
            "--rating" => {
                index += 1;
                rating = Some(parse_u32(parts.get(index), "--rating")?);
            }
            other => return Err(format!("unknown hero argument: {other}")),
        }
        index += 1;
    }

    let hero = HeroService::read(HeroInput {
        raw_name: name
            .ok_or("usage: cli hero --name <name> --level-raw <n> --xp <xp> --rating <rating>")?,
        raw_level: raw_level
            .ok_or("usage: cli hero --name <name> --level-raw <n> --xp <xp> --rating <rating>")?,
        experience: Xp(xp),
        rating: HeroRating(
            rating.ok_or(
                "usage: cli hero --name <name> --level-raw <n> --xp <xp> --rating <rating>",
            )?,
        ),
    });

    println!(
        "name={} level={} prestige={} xp={} need={} rating={} league={}",
        hero.name,
        hero.level,
        hero.prestige,
        hero.experience,
        hero.exp_need,
        hero.rating,
        hero.league
    );
    Ok(())
}

fn parse_u32(value: Option<&String>, flag: &str) -> Result<u32, String> {
    value
        .ok_or_else(|| format!("{flag} requires a value"))?
        .parse::<u32>()
        .map_err(|err| format!("invalid {flag} value: {err}"))
}

fn parse_u64(value: Option<&String>, flag: &str) -> Result<u64, String> {
    value
        .ok_or_else(|| format!("{flag} requires a value"))?
        .parse::<u64>()
        .map_err(|err| format!("invalid {flag} value: {err}"))
}

fn command_item_level(parts: Vec<String>) -> Result<(), String> {
    let mut rarity: Option<String> = None;
    let mut level: Option<u32> = None;
    let mut cards = 0u32;
    let mut index = 0;

    while index < parts.len() {
        match parts[index].as_str() {
            "--rarity" => {
                index += 1;
                rarity = Some(parts.get(index).ok_or("--rarity requires a value")?.clone());
            }
            "--level" => {
                index += 1;
                level = Some(parse_u32(parts.get(index), "--level")?);
            }
            "--cards" => {
                index += 1;
                cards = parse_u32(parts.get(index), "--cards")?;
            }
            other => return Err(format!("unknown item-level argument: {other}")),
        }
        index += 1;
    }

    let rarity = RarityService::parse(
        rarity
            .as_deref()
            .ok_or("usage: cli item-level --rarity R --level L [--cards C]")?,
    )?;
    let level = ItemLevel(level.ok_or("usage: cli item-level --rarity R --level L [--cards C]")?);
    let info = ItemLevelService::inspect(rarity, level, Cards(cards));
    let cards_need = info
        .cards_need
        .map(|value| value.to_string())
        .unwrap_or_else(|| "-1".to_string());

    println!(
        "cards_need={} total_xp={} upgradable={}",
        cards_need, info.total_xp, info.upgradable
    );
    Ok(())
}

fn command_unlock(parts: Vec<String>) -> Result<(), String> {
    let mut value: Option<String> = None;
    let mut file: Option<PathBuf> = None;
    let mut index = 0;

    while index < parts.len() {
        match parts[index].as_str() {
            "--value" => {
                index += 1;
                value = Some(parts.get(index).ok_or("--value requires a string")?.clone());
            }
            "--file" => {
                index += 1;
                file = Some(PathBuf::from(
                    parts.get(index).ok_or("--file requires a path")?,
                ));
            }
            other => return Err(format!("unknown unlock argument: {other}")),
        }
        index += 1;
    }

    if let Some(value) = value {
        let skin = SkinService::parse(&value);
        let banner = BannerService::parse(&value);
        match (skin, banner) {
            (Some(skin), Some(banner)) => println!(
                "skin owner={} skin={} banner name={}",
                skin.owner, skin.skin, banner.name
            ),
            (Some(skin), None) => println!("skin owner={} skin={}", skin.owner, skin.skin),
            (None, Some(banner)) => println!("banner name={}", banner.name),
            (None, None) => println!("none"),
        }
        return Ok(());
    }

    if let Some(file) = file {
        let raw = fs::read_to_string(&file)
            .map_err(|err| format!("could not read {}: {err}", file.display()))?;
        let json: Value = serde_json::from_str(&raw)
            .map_err(|err| format!("invalid json {}: {err}", file.display()))?;
        let values = json
            .get("UL")
            .and_then(Value::as_array)
            .ok_or_else(|| format!("{} does not contain UL array", file.display()))?;
        let strings = values.iter().filter_map(Value::as_str).collect::<Vec<_>>();
        let unlocks = UnlockService::inspect(strings);
        println!(
            "skins={} banners={}",
            unlocks.skins.len(),
            unlocks.banners.len()
        );
        for (owner, skins) in unlocks.skins {
            println!("skin owner={} skins={}", owner, skins.join(","));
        }
        if !unlocks.banners.is_empty() {
            println!("banners={}", unlocks.banners.join(","));
        }
        return Ok(());
    }

    Err("usage: cli unlock --value <unlock> | --file <profile.json>".to_string())
}

fn command_profile_check(parts: Vec<String>) -> Result<(), String> {
    let mut file: Option<PathBuf> = None;
    let mut index = 0;

    while index < parts.len() {
        match parts[index].as_str() {
            "--file" => {
                index += 1;
                file = Some(PathBuf::from(
                    parts.get(index).ok_or("--file requires a path")?,
                ));
            }
            other => return Err(format!("unknown profile-check argument: {other}")),
        }
        index += 1;
    }

    let file = file.ok_or("usage: cli profile-check --file <profile.json>")?;
    let raw = fs::read_to_string(&file)
        .map_err(|err| format!("could not read {}: {err}", file.display()))?;
    let json: Value = serde_json::from_str(&raw)
        .map_err(|err| format!("invalid json {}: {err}", file.display()))?;

    let data = json.get("Data");
    let input = ProfileCheckInput {
        has_data: data.is_some(),
        outer_uid: json.get("UID").and_then(Value::as_str).map(str::to_string),
        data_uid: data
            .and_then(|value| value.get("UID"))
            .and_then(Value::as_str)
            .map(str::to_string),
        name: json.get("Name").and_then(Value::as_str).map(str::to_string),
        has_hero: json.get("Hero").is_some(),
        has_item: json.get("Item").is_some(),
    };

    let report = ProfileCheckService::check(&input);
    if report.is_valid() {
        println!(
            "valid uid={} name={}",
            input.uid().unwrap_or("<missing>"),
            input.clean_name().unwrap_or("<missing>")
        );
        return Ok(());
    }

    println!("invalid issues={}", report.issues.len());
    for issue in &report.issues {
        println!("- {issue}");
    }
    Err("profile check failed".to_string())
}

fn command_profile_score(parts: Vec<String>) -> Result<(), String> {
    let file = single_file_arg(parts, "profile-score")?;
    let json = read_json_file(&file)?;
    let input = profile_score_input_from_json(&json);
    let score = ProfileScoreService::read(&input);

    println!(
        "trophy={} bonus={} total={} area={}",
        score.trophy, score.bonus_trophy, score.total_trophies, score.area
    );
    Ok(())
}

fn profile_score_input_from_json(json: &Value) -> ProfileScoreInput {
    ProfileScoreInput {
        trophy: json.get("Trophy").and_then(Value::as_u64),
        bonus_trophy: json.get("BonusTrophy").and_then(Value::as_u64),
    }
}

fn command_profile_wallet(parts: Vec<String>) -> Result<(), String> {
    let file = single_file_arg(parts, "profile-wallet")?;
    let json = read_json_file(&file)?;
    let input = profile_wallet_input_from_json(&json);
    let wallet = ProfileWalletService::read(&input);

    println!("coins={} gems={}", wallet.coins, wallet.gems);
    Ok(())
}

fn profile_wallet_input_from_json(json: &Value) -> ProfileWalletInput {
    let currency = json.get("Currency");
    ProfileWalletInput {
        coins: currency
            .and_then(|value| value.get("coins"))
            .and_then(Value::as_u64),
        gems: currency
            .and_then(|value| value.get("gems"))
            .and_then(Value::as_u64),
    }
}

fn command_profile_id(parts: Vec<String>) -> Result<(), String> {
    let file = single_file_arg(parts, "profile-id")?;
    let json = read_json_file(&file)?;
    let input = profile_identity_input_from_json(&json);

    match ProfileIdentityService::read(&input) {
        Ok(identity) => {
            println!("uid={} name={}", identity.uid, identity.name);
            Ok(())
        }
        Err(issues) => {
            println!("invalid identity issues={}", issues.len());
            for issue in issues {
                println!("- {issue}");
            }
            Err("profile identity read failed".to_string())
        }
    }
}

fn single_file_arg(parts: Vec<String>, command: &str) -> Result<PathBuf, String> {
    let mut file: Option<PathBuf> = None;
    let mut index = 0;

    while index < parts.len() {
        match parts[index].as_str() {
            "--file" => {
                index += 1;
                file = Some(PathBuf::from(
                    parts.get(index).ok_or("--file requires a path")?,
                ));
            }
            other => return Err(format!("unknown {command} argument: {other}")),
        }
        index += 1;
    }

    file.ok_or_else(|| format!("usage: cli {command} --file <profile.json>"))
}

fn read_json_file(file: &Path) -> Result<Value, String> {
    let raw = fs::read_to_string(file)
        .map_err(|err| format!("could not read {}: {err}", file.display()))?;
    serde_json::from_str(&raw).map_err(|err| format!("invalid json {}: {err}", file.display()))
}

fn profile_identity_input_from_json(json: &Value) -> ProfileIdentityInput {
    let data = json.get("Data");
    ProfileIdentityInput {
        outer_uid: json.get("UID").and_then(Value::as_str).map(str::to_string),
        data_uid: data
            .and_then(|value| value.get("UID"))
            .and_then(Value::as_str)
            .map(str::to_string),
        name: json.get("Name").and_then(Value::as_str).map(str::to_string),
    }
}

fn command_intern(parts: Vec<String>) -> Result<(), String> {
    if parts.is_empty() {
        return Err("usage: cli intern <string> [string ...]".to_string());
    }

    let mut pool = StringPool::new();
    for value in parts {
        let id = pool.intern(&value);
        println!("{} {}", id, value);
    }
    println!("unique={}", pool.len());
    Ok(())
}

fn command_catalog_summary(parts: Vec<String>) -> Result<(), String> {
    let mut items_file: Option<PathBuf> = None;
    let mut index = 0;

    while index < parts.len() {
        match parts[index].as_str() {
            "--items-file" => {
                index += 1;
                items_file = Some(PathBuf::from(
                    parts.get(index).ok_or("--items-file requires a path")?,
                ));
            }
            other => return Err(format!("unknown catalog-summary argument: {other}")),
        }
        index += 1;
    }

    let project_root = find_project_root()?;
    let items_file = items_file.unwrap_or_else(|| latest_plain_items_file(&project_root));
    let json = read_json_file(&items_file)?;
    let items = items_array(&json, &items_file)?;
    let mut catalog = CatalogColumns::new();
    let mut skipped = 0usize;

    for item in items {
        let item_id = item.get("id").and_then(Value::as_str);
        let name = item.get("name").and_then(Value::as_str).or(item_id);
        let rarity = item
            .get("rarity")
            .and_then(Value::as_str)
            .and_then(|value| RarityService::parse(value).ok());
        let first_tooltip = item
            .get("tooltips")
            .and_then(Value::as_array)
            .and_then(|values| values.first())
            .and_then(Value::as_str)
            .map(str::to_string);

        let (Some(item_id), Some(name), Some(rarity)) = (item_id, name, rarity) else {
            skipped += 1;
            continue;
        };

        catalog.push(CatalogItemInput {
            item_id: item_id.to_string(),
            name: name.to_string(),
            rarity,
            first_tooltip,
        });
    }

    println!(
        "items={} strings={} skipped={} source={}",
        catalog.len(),
        catalog.string_count(),
        skipped,
        items_file.display()
    );

    if !catalog.is_empty() {
        let first = rbackend_core::ItemId::new(0);
        println!(
            "first id={} name={} slug={} image_key={} rarity={}",
            catalog.item_id(first).unwrap_or("<missing>"),
            catalog.name(first).unwrap_or("<missing>"),
            catalog.slug(first).unwrap_or("<missing>"),
            catalog.image_key(first).unwrap_or("<missing>"),
            catalog
                .rarity(first)
                .map(|value| value.to_string())
                .unwrap_or_else(|| "<missing>".to_string())
        );
    }

    Ok(())
}

fn command_check_images(parts: Vec<String>) -> Result<(), String> {
    let mut items_file: Option<PathBuf> = None;
    let mut web_root: Option<PathBuf> = None;
    let mut index = 0;

    while index < parts.len() {
        match parts[index].as_str() {
            "--items-file" => {
                index += 1;
                items_file = Some(PathBuf::from(
                    parts.get(index).ok_or("--items-file requires a path")?,
                ));
            }
            "--web-root" => {
                index += 1;
                web_root = Some(PathBuf::from(
                    parts.get(index).ok_or("--web-root requires a path")?,
                ));
            }
            other => return Err(format!("unknown check-images argument: {other}")),
        }
        index += 1;
    }

    let project_root = find_project_root()?;
    let items_file = items_file.unwrap_or_else(|| latest_plain_items_file(&project_root));
    let web_root = web_root.unwrap_or_else(|| project_root.join("Frontend/Web"));
    let images_root = web_root.join("static/images/items");

    let raw = fs::read_to_string(&items_file)
        .map_err(|err| format!("could not read {}: {err}", items_file.display()))?;
    let json: Value = serde_json::from_str(&raw)
        .map_err(|err| format!("invalid json {}: {err}", items_file.display()))?;
    let items = items_array(&json, &items_file)?;

    let mut missing = Vec::new();
    for item in items {
        let name = item
            .get("name")
            .and_then(Value::as_str)
            .or_else(|| item.get("id").and_then(Value::as_str));
        let Some(name) = name else { continue };
        let rarity = item.get("rarity").and_then(Value::as_str);
        let first_tooltip = item
            .get("tooltips")
            .and_then(Value::as_array)
            .and_then(|values| values.first())
            .and_then(Value::as_str);
        let key = ItemIconService::image_key(name, rarity, first_tooltip);

        for format in ["webp", "avif"] {
            let expected = images_root.join(format).join(format!("{key}.{format}"));
            if !expected.exists() {
                missing.push(format!("[{format}] {name}: {}", expected.display()));
            }
        }
    }

    if !missing.is_empty() {
        eprintln!("missing item images: {}", missing.len());
        for line in missing.iter().take(100) {
            eprintln!("- {line}");
        }
        if missing.len() > 100 {
            eprintln!("...and {} more", missing.len() - 100);
        }
        return Err("image audit failed".to_string());
    }

    println!(
        "image audit OK: {} items checked ({})",
        items.len(),
        items_file.display()
    );
    Ok(())
}

fn items_array<'a>(json: &'a Value, file: &Path) -> Result<&'a Vec<Value>, String> {
    json.as_array()
        .or_else(|| json.get("items").and_then(Value::as_array))
        .ok_or_else(|| format!("{} is not an items array/object", file.display()))
}

fn find_project_root() -> Result<PathBuf, String> {
    let mut current = env::current_dir().map_err(|err| err.to_string())?;
    loop {
        if current.join("Backend/DB").is_dir() && current.join("Frontend/Web").is_dir() {
            return Ok(current);
        }
        if !current.pop() {
            return Err("could not find project root with Backend/DB and Frontend/Web".to_string());
        }
    }
}

fn latest_plain_items_file(project_root: &Path) -> PathBuf {
    let db = project_root.join("Backend/DB");
    let mut best: Option<(PathBuf, (u32, u32, u32))> = None;

    if let Ok(entries) = fs::read_dir(&db) {
        for entry in entries.flatten() {
            let path = entry.path();
            let Some(name) = path.file_name().and_then(|value| value.to_str()) else {
                continue;
            };
            if let Some(version) = plain_items_version(name) {
                if best
                    .as_ref()
                    .is_none_or(|(_, best_version)| version > *best_version)
                {
                    best = Some((path, version));
                }
            }
        }
    }

    best.map(|(path, _)| path)
        .unwrap_or_else(|| db.join("items_5_0_0.json"))
}

fn plain_items_version(name: &str) -> Option<(u32, u32, u32)> {
    let rest = name.strip_prefix("items_")?.strip_suffix(".json")?;
    if rest.starts_with("en_") || rest.starts_with("ru_") || rest == "tooltips" {
        return None;
    }
    let parts = rest
        .split('_')
        .map(str::parse::<u32>)
        .collect::<Result<Vec<_>, _>>()
        .ok()?;
    match parts.as_slice() {
        [major, minor, patch] => Some((*major, *minor, *patch)),
        _ => None,
    }
}

fn print_help() {
    println!("cli — first oracle CLI prototype");
    println!();
    println!("commands:");
    println!("  slug <item name>                             print canonical slug via SlugService");
    println!("  image-key [--rarity R] [--tooltip T] <name> print image key via ItemIconService");
    println!("  level --xp <total xp>                       print level/current/need");
    println!("  area --trophy <trophy> [--bonus <bonus>]    print two-digit area code");
    println!("  hero --name N --level-raw L --xp XP --rating R print normalized hero");
    println!("  item-level --rarity R --level L [--cards C] print item cards/xp info");
    println!("  unlock --value U | --file profile.json       inspect skins/banners");
    println!("  profile-check --file profile.json           validate basic profile shape");
    println!("  profile-id --file profile.json              print selected UID and Name");
    println!("  profile-wallet --file profile.json          print coins and gems");
    println!("  profile-score --file profile.json           print trophies and area");
    println!("  intern <string> [string ...]                demo StringPool interning");
    println!("  catalog-summary [--items-file P]            build first DOD catalog columns");
    println!("  check-images [--items-file P] [--web-root P] validate item image files");
}
