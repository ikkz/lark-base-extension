use super::*;

pub(crate) fn new() ->RegexRule {
    RegexRule::new(
        "space_between_ch_en",
        vec![r"(?<h>[\u4e00-\u9fa5][a-zA-Z\d])", r"(?<h>[a-zA-Z\d][\u4e00-\u9fa5])"],
        vec![
            (r"(?<c>[\u4e00-\u9fa5])(?<e>[a-zA-Z\d])", "$c $e"),
            (r"(?<e>[a-zA-Z\d])(?<c>[\u4e00-\u9fa5])", "$e $c"),
        ],
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_space_between_ch_en() {
        let rule = new();

        // Test case 1: Chinese character followed by English character
        let input = "你好world";
        let expected_output = "你好 world";
        assert_eq!(rule.test(input), Some(vec![(1, 3)]));
        assert_eq!(rule.fix(input), expected_output);

        // Test case 2: English character followed by Chinese character
        let input = "hello世界";
        let expected_output = "hello 世界";
        assert_eq!(rule.test(input), Some(vec![(4, 6)]));
        assert_eq!(rule.fix(input), expected_output);

        // Test case 3: No space needed
        let input = "hello world";
        let expected_output = "hello world";
        assert_eq!(rule.test(input), None);
        assert_eq!(rule.fix(input), expected_output);

        // Test case 4: Chinese character followed by Arabic numeral
        let input = "你好123";
        let expected_output = "你好 123";
        assert_eq!(rule.test(input), Some(vec![(1, 3)]));
        assert_eq!(rule.fix(input), expected_output);

        // Test case 5: Arabic numeral followed by Chinese character
        let input = "456世界";
        let expected_output = "456 世界";
        assert_eq!(rule.test(input), Some(vec![(2, 4)]));
        assert_eq!(rule.fix(input), expected_output);
    }
}
