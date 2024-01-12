use super::*;

pub(crate) fn build_rule() -> RegexRule {
    RegexRule::new(
        "no_space_between_num_dp",
        vec![r"\d+(?<h>\x20+)[°%]"],
        vec![(r"(?<n>\d+)\x20+(?<u>[°%])", "$n$u")],
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_space_between_num_dp() {
        let rule = build_rule();

        // Test case 1: Input with space between number and degree symbol
        let input = "25 °";
        let expected_output = "25°";
        assert_eq!(rule.test(input), Some(vec![(2, 3)]));
        assert_eq!(rule.fix(input), expected_output);

        // Test case 2: Input with space between number and percentage symbol
        let input = "50 %";
        let expected_output = "50%";
        assert_eq!(rule.test(input), Some(vec![(2, 3)]));
        assert_eq!(rule.fix(input), expected_output);

        // Test case 3: Input without space between number and degree symbol
        let input = "100°";
        let expected_output = "100°";
        assert_eq!(rule.test(input), None);
        assert_eq!(rule.fix(input), expected_output);

        // Test case 4: Input without space between number and percentage symbol
        let input = "75%";
        let expected_output = "75%";
        assert_eq!(rule.test(input), None);
        assert_eq!(rule.fix(input), expected_output);

        // Test case 5: Input with multiple spaces between number and degree symbol
        let input = "10    °";
        let expected_output = "10°";
        assert_eq!(rule.test(input), Some(vec![(2, 6)]));
        assert_eq!(rule.fix(input), expected_output);
    }
}
