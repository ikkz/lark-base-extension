mod config;
mod rules;
mod utils;

use crate::utils::set_panic_hook;

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
struct TestResult {
    configs: Vec<String>,
    results: Vec<Vec<Option<Vec<(usize, usize)>>>>,
}

#[wasm_bindgen]
pub fn test(text_list: &str, config: &str) -> String {
    set_panic_hook();
    let text_list: Vec<String> = serde_json::from_str(text_list).unwrap();
    let rules = config::build_rules(config);
    serde_json::to_string(&TestResult {
        configs: rules.iter().map(|r| r.id().into()).collect::<Vec<_>>(),
        results: text_list
            .iter()
            .map(|text| rules.iter().map(|rule| rule.test(text)).collect::<Vec<_>>())
            .collect::<Vec<_>>(),
    })
    .unwrap()
}

#[derive(Serialize, Deserialize)]
struct FixResult {
    configs: Vec<String>,
    results: Vec<String>,
}

#[wasm_bindgen]
pub fn fix(text_list: &str, config: &str) -> String {
    set_panic_hook();
    let text_list: Vec<String> = serde_json::from_str(text_list).unwrap();
    let rules = config::build_rules(config);
    serde_json::to_string(&FixResult {
        configs: rules.iter().map(|r| r.id().into()).collect::<Vec<_>>(),
        results: text_list
            .iter()
            .map(|text| {
                rules
                    .iter()
                    .fold(text.clone(), |text, rule| rule.fix(&text))
            })
            .collect::<Vec<_>>(),
    })
    .unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_test() {
        let text_list = r#"["leo你好, world! 10 %", "123.456"]"#;
        let config = r#"
            {
                "no_space_around_full_width_punctuation": true,
                "no_space_between_num_dp": true,
                "space_between_ch_en": true,
                "uniform_punctuation": true
            }
        "#;
        let result = test(text_list, config);
        let expected_result = "{\"configs\":[\"space_between_ch_en\",\"no_space_between_num_dp\",\"uniform_punctuation\",\"no_space_around_full_width_punctuation\"],\"results\":[[[[2,4]],[[16,17]],[[5,6],[12,13]],null],[null,null,null,null]]}";
        assert_eq!(result, expected_result);
    }

    #[test]
    fn test_fix() {
        let text_list = r#"["leo你好, world! 10 %", "123.456"]"#;
        let config = r#"
            {
                "no_space_around_full_width_punctuation": true,
                "no_space_between_num_dp": true,
                "space_between_ch_en": true,
                "uniform_punctuation": true
            }
        "#;
        let result = fix(text_list, config);
        let expected_result = "{\"configs\":[\"space_between_ch_en\",\"no_space_between_num_dp\",\"uniform_punctuation\",\"no_space_around_full_width_punctuation\"],\"results\":[\"leo 你好，world！10%\",\"123.456\"]}";
        assert_eq!(result, expected_result);
    }
}
