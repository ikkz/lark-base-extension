use super::*;

const PUNCTUATIONS: &str = "。、，：；“”‘’？！（）【】｛｝《》……—～";

pub(crate) fn new() -> RegexRule {
    RegexRule::new(
        "no_space_around_full_width_punctuation",
        vec![
            &format!(r"[{}](?<h>\x20+)", PUNCTUATIONS),
            &format!(r"(?<h>\x20+)[{}]", PUNCTUATIONS),
        ],
        vec![
            (&format!(r"(?<p>[{}])(?<s>\x20+)", PUNCTUATIONS), "$p"),
            (&format!(r"(?<s>\x20+)(?<p>[{}])", PUNCTUATIONS), "$p"),
        ],
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_space_around_full_width_punctuation() {
        let rule = new();

        // Test case 1: Punctuation followed by space
        let input1 = "Hello。 World";
        let expected1 = "Hello。World";
        assert_eq!(rule.test(input1), Some(vec![(6, 7)]));
        assert_eq!(rule.fix(input1), expected1);

        // Test case 2: Space followed by punctuation
        let input2 = "Hello ！World";
        let expected2 = "Hello！World";
        assert_eq!(rule.test(input2), Some(vec![(5, 6)]));
        assert_eq!(rule.fix(input2), expected2);

        // Test case 3: Multiple spaces around punctuation
        let input3 = "Hello ？  World";
        let expected3 = "Hello？World";
        assert_eq!(rule.test(input3), Some(vec![(5, 6), (7, 9)]));
        assert_eq!(rule.fix(input3), expected3);
    }
}
