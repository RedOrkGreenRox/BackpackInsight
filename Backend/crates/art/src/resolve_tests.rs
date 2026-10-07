use super::{Resolved, Resolver};
use crate::kit::KitIndex;
use crate::rules::Rules;
use crate::test_kit::TestKit;

const RULES: &str = r#"
[sources]
roots = ["Items", "ui/Icons/Boons"]
states = ["Empty", "open"]
cell_sizes = [60, 120]
aspect_tolerance = 0.08
default_rotate = 90

[alias]
"Spiked Whip" = "Spike Whip"
"Borrowed Vigor" = "boon-vigor"

[layers]
"Pie Stack" = ["Crust", "Lattice"]

[rotate]
"Broken Oar" = 270

[missing]
"Royal Banana" = "no art"

[heist]
plan = "Heist Plan {step}"
stamp = "Heist Plan - {theme}"

[heist.themes]
"Boomscrolling" = "Scroll"
"#;

fn kit() -> TestKit {
    let kit = TestKit::new();
    for rel in [
        "Items/Shared/Antivenom.png",
        "Items/Shared/Antivenom Empty.png",
        "Items/Buzz/Spike Whip.png",
        "Items/Hob/Heist Plan 2.png",
        "Items/Hob/Heist Plan - Scroll.png",
        "Items/Pepper/Crust.png",
        "Items/Pepper/Lattice.png",
        "Items/Morrow/Broken Oar.png",
        "Items/Shared/Brown Rat.png",
        "ui/Icons/Boons/Season07/boon-vigor.png",
    ] {
        kit.png(rel, 4, 4, [1, 2, 3, 255]);
    }
    kit
}

fn resolve(id: &str, name: &str) -> Result<Resolved, String> {
    let kit = kit();
    let rules = Rules::parse(RULES).unwrap_or_else(|err| panic!("{err}"));
    let index =
        KitIndex::scan(kit.path(), &rules.sources.roots).unwrap_or_else(|err| panic!("{err}"));
    Resolver::new(&index, &rules).resolve(id, name)
}

fn layer_names(resolved: &Resolved) -> Vec<String> {
    match resolved {
        Resolved::Art(source) => source
            .layers
            .iter()
            .filter_map(|p| p.file_stem().and_then(|s| s.to_str()).map(str::to_owned))
            .collect(),
        Resolved::Missing(reason) => vec![format!("missing: {reason}")],
    }
}

#[test]
fn plain_item_finds_file_by_id_with_states() {
    let resolved = resolve("Antivenom", "Antivenom").unwrap_or_else(|err| panic!("{err}"));
    assert_eq!(layer_names(&resolved), ["Antivenom"]);
    let Resolved::Art(source) = resolved else {
        panic!("expected art")
    };
    assert!(source.states.contains_key("Empty"));
}

#[test]
fn falls_back_to_name_then_alias() {
    let by_name = resolve("Rat", "Brown Rat").unwrap_or_else(|err| panic!("{err}"));
    assert_eq!(layer_names(&by_name), ["Brown Rat"]);
    let aliased = resolve("Spiked Whip", "Spiked Whip").unwrap_or_else(|err| panic!("{err}"));
    assert_eq!(layer_names(&aliased), ["Spike Whip"]);
    let boon = resolve("Borrowed Vigor", "Borrowed Vigor").unwrap_or_else(|err| panic!("{err}"));
    assert_eq!(layer_names(&boon), ["boon-vigor"]);
}

#[test]
fn heist_step_is_scroll_plus_stamp() {
    let resolved =
        resolve("Boomscrolling II", "Boomscrolling").unwrap_or_else(|err| panic!("{err}"));
    assert_eq!(
        layer_names(&resolved),
        ["Heist Plan 2", "Heist Plan - Scroll"]
    );
}

#[test]
fn layers_rotate_and_missing_come_from_rules() {
    let pie = resolve("Pie Stack", "Pie Stack").unwrap_or_else(|err| panic!("{err}"));
    assert_eq!(layer_names(&pie), ["Crust", "Lattice"]);
    let Ok(Resolved::Art(oar)) = resolve("Broken Oar", "Broken Oar") else {
        panic!("expected art")
    };
    assert_eq!(oar.rotate, Some(270));
    assert_eq!(
        resolve("Royal Banana", "Royal Banana"),
        Ok(Resolved::Missing("no art".to_owned()))
    );
}

#[test]
fn unknown_item_is_an_error_naming_the_id() {
    let err = resolve("Brand New Thing", "Brand New Thing")
        .err()
        .unwrap_or_default();
    assert!(err.contains("Brand New Thing"), "{err}");
}
