use crate::utils::{byte_range_to_char_range, prev_next_char, vec_to_option};

use super::*;
use lazy_static::*;

lazy_static! {
    static ref PUNCTUATIONS: Vec<(char, char)> = vec![
        ('，', ','),
        ('。', '.'),
        ('！', '!'),
        ('？', '?'),
        ('；', ';'),
        ('：', ':'),
    ];
    static ref CH_PUNCTUATIONS_REGEX: regex::Regex = regex::Regex::new(&format!(
        r"[{}]",
        PUNCTUATIONS.iter().map(|(ch, _)| *ch).collect::<String>()
    ))
    .unwrap();
    static ref EN_PUNCTUATIONS_REGEX: regex::Regex = regex::Regex::new(&format!(
        r"[{}]",
        PUNCTUATIONS.iter().map(|(_, ch)| *ch).collect::<String>()
    ))
    .unwrap();
    static ref CH_REGEX: regex::Regex = regex::Regex::new(r"[\u4e00-\u9fa5]").unwrap();
}

pub(crate) struct UniformPunctuation;

impl Rule for UniformPunctuation {
    fn id(&self) -> &str {
        "uniform_punctuation"
    }

    fn test(&self, text: &str) -> Option<Vec<(usize, usize)>> {
        vec_to_option(if CH_REGEX.is_match(text) {
            EN_PUNCTUATIONS_REGEX
                .find_iter(text)
                .filter(|cap| {
                    if cap.as_str() == "." {
                        let (prev, next) =
                            prev_next_char(text, utf8_slice::len(&text[0..cap.start()]));
                        !(prev.is_some_and(|c| c.is_numeric() || c.eq(&'.'))
                            || next.is_some_and(|c| c.is_numeric() || c.eq(&'.')))
                    } else {
                        true
                    }
                })
                .map(|m| byte_range_to_char_range(text, (m.start(), m.end())))
                .collect::<Vec<_>>()
        } else {
            CH_PUNCTUATIONS_REGEX
                .find_iter(text)
                .map(|m| byte_range_to_char_range(text, (m.start(), m.end())))
                .collect::<Vec<_>>()
        })
    }

    fn fix(&self, text: &str) -> String {
        if CH_REGEX.is_match(text) {
            EN_PUNCTUATIONS_REGEX
                .replace_all(text, |caps: &regex::Captures| {
                    let cap = caps.get(0).unwrap();
                    if cap.as_str().eq(".") {
                        let (prev, next) =
                            prev_next_char(text, utf8_slice::len(&text[0..cap.start()]));
                        if prev.is_some_and(|c| c.is_numeric() || c.eq(&'.'))
                            || next.is_some_and(|c| c.is_numeric() || c.eq(&'.'))
                        {
                            return ".".to_string();
                        }
                    }
                    PUNCTUATIONS
                        .iter()
                        .find(|(_, ch)| *ch == caps[0].chars().next().unwrap())
                        .unwrap()
                        .0
                        .to_string()
                })
                .into()
        } else {
            CH_PUNCTUATIONS_REGEX
                .replace_all(text, |caps: &regex::Captures| {
                    PUNCTUATIONS
                        .iter()
                        .find(|(ch, _)| *ch == caps[0].chars().next().unwrap())
                        .unwrap()
                        .1
                        .to_string()
                })
                .into()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_uniform_punctuation_ch() {
        let rule = UniformPunctuation;
        let text = "这是一段中文文本,包含英文标点符号.";
        assert_eq!(rule.test(text), Some(vec![(8, 9), (17, 18)]));
        assert_eq!(rule.fix(text), "这是一段中文文本，包含英文标点符号。");
    }

    #[test]
    fn test_uniform_punctuation_en() {
        let rule = UniformPunctuation;
        let text = "This is an English text， including Chinese punctuation marks。";
        assert_eq!(rule.test(text), Some(vec![(23, 24), (60, 61)]));
        assert_eq!(
            rule.fix(text),
            "This is an English text, including Chinese punctuation marks."
        );
    }

    #[test]
    fn test_uniform_punctuation_mixed() {
        let rule = UniformPunctuation;
        let text = "这是一段中文文本，包含English punctuation marks.";
        assert_eq!(rule.test(text), Some(vec![(36, 37)]));
        assert_eq!(
            rule.fix(text),
            "这是一段中文文本，包含English punctuation marks。"
        );
    }
    #[test]
    fn test_uniform_punctuation_ch_with_numbers() {
        let rule = UniformPunctuation;
        let text = "这是一段中文文本，包含数字1.2和3.4。";
        assert_eq!(rule.test(text), None);
        assert_eq!(rule.fix(text), "这是一段中文文本，包含数字1.2和3.4。");
    }

    #[test]
    fn test_uniform_punctuation_ch_with_dot() {
        let rule = UniformPunctuation;
        let text = "这是一段中文文本，包含.符号。";
        assert_eq!(rule.test(text), Some(vec![(11, 12)]));
        assert_eq!(rule.fix(text), "这是一段中文文本，包含。符号。");
    }

    #[test]
    fn test_uniform_punctuation_num_list() {
        let rule = UniformPunctuation;
        let text = "1. todo\n2. 中文\n3. English";
        assert_eq!(rule.test(text), None);
        assert_eq!(rule.fix(text), "1. todo\n2. 中文\n3. English");
    }
}
