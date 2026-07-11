use std::fmt;
use unicode_normalization::UnicodeNormalization;

/// Доменный тип имени предмета.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct ItemName(String);

impl ItemName {
    pub fn new(value: impl Into<String>) -> Self {
        Self(value.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl From<&str> for ItemName {
    fn from(value: &str) -> Self {
        Self::new(value)
    }
}

impl From<String> for ItemName {
    fn from(value: String) -> Self {
        Self::new(value)
    }
}

impl fmt::Display for ItemName {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

/// Доменный тип slug.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Slug(String);

impl Slug {
    pub fn new_unchecked(value: impl Into<String>) -> Self {
        Self(value.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

impl fmt::Display for Slug {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.0)
    }
}

/// Единый сервис slug-логики.
///
/// Поведение повторяет текущий `Frontend/Web/ground/utils/SlugService.ts`:
///
/// - lower-case;
/// - NFKD normalization;
/// - removal of combining marks;
/// - apostrophes become hyphens;
/// - every non `[a-z0-9]` run becomes one hyphen;
/// - repeated/edge hyphens are trimmed.
pub struct SlugService;

impl SlugService {
    pub fn to_slug(name: impl Into<ItemName>) -> Slug {
        let name = name.into();
        let mut output = String::with_capacity(name.as_str().len());
        let mut last_was_dash = false;

        for ch in name.as_str().to_lowercase().nfkd() {
            if is_combining_mark(ch) {
                continue;
            }

            if ch.is_ascii_alphanumeric() {
                output.push(ch);
                last_was_dash = false;
                continue;
            }

            if !last_was_dash && !output.is_empty() {
                output.push('-');
                last_was_dash = true;
            }
        }

        while output.ends_with('-') {
            output.pop();
        }

        Slug(output)
    }

    pub fn roman_to_arabic(roman: &str) -> Option<u32> {
        let mut total = 0u32;
        let mut prev = 0u32;

        for ch in roman.chars().rev() {
            let value = roman_value(ch)?;
            if value < prev {
                total = total.saturating_sub(value);
            } else {
                total = total.saturating_add(value);
                prev = value;
            }
        }

        if total == 0 || !Self::is_roman_numeral(roman) {
            None
        } else {
            Some(total)
        }
    }

    pub fn is_roman_numeral(value: &str) -> bool {
        let value = value.trim().to_ascii_uppercase();
        if value.is_empty() {
            return false;
        }

        // Good enough for current project use: Step I..XX etc.
        let valid_chars = value
            .chars()
            .all(|ch| matches!(ch, 'I' | 'V' | 'X' | 'L' | 'C' | 'D' | 'M'));
        if !valid_chars {
            return false;
        }

        let mut repeat_count = 0usize;
        let mut last = '\0';
        for ch in value.chars() {
            if ch == last {
                repeat_count += 1;
                if matches!(ch, 'V' | 'L' | 'D') || repeat_count >= 3 {
                    return false;
                }
            } else {
                repeat_count = 0;
                last = ch;
            }
        }

        true
    }
}

fn is_combining_mark(ch: char) -> bool {
    matches!(ch as u32, 0x0300..=0x036F)
}

fn roman_value(ch: char) -> Option<u32> {
    match ch.to_ascii_uppercase() {
        'I' => Some(1),
        'V' => Some(5),
        'X' => Some(10),
        'L' => Some(50),
        'C' => Some(100),
        'D' => Some(500),
        'M' => Some(1000),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::{ItemName, SlugService};

    #[test]
    fn slug_matches_current_typescript_examples() {
        let cases = [
            ("Wooden Sword", "wooden-sword"),
            ("Robo Rat 2.0", "robo-rat-2-0"),
            ("Hunter’s Bow", "hunter-s-bow"),
            ("Book of Dark Secrets", "book-of-dark-secrets"),
            ("  Weird---Name  ", "weird-name"),
            ("Élite Blade", "elite-blade"),
        ];

        for (input, expected) in cases {
            assert_eq!(
                SlugService::to_slug(ItemName::from(input)).as_str(),
                expected
            );
        }
    }

    #[test]
    fn slug_is_empty_for_non_latin_names_like_current_frontend() {
        assert_eq!(SlugService::to_slug("меч").as_str(), "");
    }

    #[test]
    fn roman_numbers_are_available_for_future_item_icon_logic() {
        assert!(SlugService::is_roman_numeral("IV"));
        assert_eq!(SlugService::roman_to_arabic("IV"), Some(4));
        assert_eq!(SlugService::roman_to_arabic("XII"), Some(12));
        assert!(!SlugService::is_roman_numeral("wood"));
    }
}
