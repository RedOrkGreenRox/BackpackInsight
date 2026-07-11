mod catalog;
mod root;

use std::env;

fn main() {
    let mut args = env::args().skip(1);
    let Some(command) = args.next() else {
        print_help();
        std::process::exit(2);
    };

    let project_root = match root::find_project_root() {
        Ok(root) => root,
        Err(error) => {
            eprintln!("{error}");
            std::process::exit(1);
        }
    };

    let result = match command.as_str() {
        "validate-catalog" => catalog::validate::validate_catalog(&project_root).map(|report| {
            println!(
                "catalog OK: items={} recipes_checked={} duplicate_slug_warnings={}",
                report.items, report.recipes_checked, report.duplicate_slug_warnings
            );
        }),
        "check-images" => catalog::images::check_images(&project_root).map(|report| {
            println!(
                "images OK: items={} files_checked={}",
                report.items, report.files_checked
            );
        }),
        "check-locales" => catalog::locales::check_locales(&project_root).map(|report| {
            println!(
                "locales OK: en={} ru={} shared={}",
                report.en_items, report.ru_items, report.shared_items
            );
        }),
        "build-catalog-flatbuffer" => catalog::flatbuffer::build_catalog_flatbuffer(&project_root)
            .map(|path| {
                println!("catalog flatbuffer written: {}", path.display());
            }),
        "verify-flatbuffer" => {
            catalog::flatbuffer::verify_flatbuffer(&project_root, None).map(|info| {
                println!(
                    "catalog flatbuffer OK: items={} schema={} first={}",
                    info.items,
                    info.schema_version,
                    info.first
                        .as_ref()
                        .map(|item| item.name.as_str())
                        .unwrap_or("<none>")
                );
            })
        }
        "build-api-items-flatbuffer" => {
            catalog::api_items_flatbuffer::build_api_items_flatbuffers(&project_root).map(|paths| {
                for path in paths {
                    println!("api items flatbuffer written: {}", path.display());
                }
            })
        }
        "verify-api-items-flatbuffer" => {
            catalog::api_items_flatbuffer::verify_api_items_flatbuffers(&project_root).map(
                |packs| {
                    for pack in packs {
                        println!(
                            "api items flatbuffer OK: lang={} items={} schema={}",
                            pack.lang,
                            pack.items.len(),
                            pack.schema_version
                        );
                    }
                },
            )
        }
        "build-all-packs" => build_all_packs(&project_root),
        "verify-all-packs" => verify_all_packs(&project_root),
        "validate-all" => validate_all(&project_root),
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

fn validate_all(project_root: &std::path::Path) -> Result<(), String> {
    catalog::validate::validate_catalog(project_root)?;
    catalog::images::check_images(project_root)?;
    catalog::locales::check_locales(project_root)?;
    println!("all data checks OK");
    Ok(())
}

fn build_all_packs(project_root: &std::path::Path) -> Result<(), String> {
    catalog::flatbuffer::build_catalog_flatbuffer(project_root)?;
    catalog::api_items_flatbuffer::build_api_items_flatbuffers(project_root)?;
    println!("all packs built");
    Ok(())
}

fn verify_all_packs(project_root: &std::path::Path) -> Result<(), String> {
    catalog::flatbuffer::verify_flatbuffer(project_root, None)?;
    catalog::api_items_flatbuffer::verify_api_items_flatbuffers(project_root)?;
    println!("all packs verified");
    Ok(())
}

fn print_help() {
    println!("build — data source validator/builder");
    println!();
    println!("commands:");
    println!("  validate-catalog       validate ids, slugs, rarity, recipes");
    println!("  check-images           validate item webp/avif files");
    println!("  check-locales          validate EN/RU catalog id coverage");
    println!("  build-catalog-flatbuffer write real catalog_summary FlatBuffer pack via flatc");
    println!("  verify-flatbuffer      verify generated catalog_summary.fb through pack reader");
    println!("  build-api-items-flatbuffer write api_items_en/ru FlatBuffer packs");
    println!("  verify-api-items-flatbuffer verify api_items_en/ru packs through pack reader");
    println!("  build-all-packs        build catalog summary and api items packs");
    println!("  verify-all-packs       verify all generated packs");
    println!("  validate-all           run catalog/images/locales checks");
}
