mod config;
mod rules;
mod utils;
use std::borrow::Borrow;

use crate::utils::set_panic_hook;

// #[cfg(feature = "parallel")]
use rayon::prelude::*;
use rules::Rule;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
struct Param {
    config: config::Config,
    texts: Vec<String>,
}

#[derive(Serialize, Deserialize)]
struct TestResult {
    config: Vec<String>,
    result: Vec<Vec<Option<Vec<(usize, usize)>>>>,
}

#[wasm_bindgen]
pub fn test(param: &str) -> String {
    set_panic_hook();
    let Param { config, texts } = serde_json::from_str(param).unwrap();
    let rules = config::build_rules(config);
    let config_list = rules.iter().map(|r| r.id().into()).collect::<Vec<_>>();
    // #[cfg(feature = "rayon")]
    {
        return serde_json::to_string(&TestResult {
            config: config_list,
            result: texts.par_iter().fold(
                || rules.iter().map(|rule| Rule::clone(rule.borrow())).collect::<Vec<_>>(),
                |rules, text| {
                    rules
                        .iter()
                        .map(|rule| rule.test(&text))
                        .collect::<Vec<_>>()
                },
            ),
        })
        .unwrap();
    }
    #[cfg(not(feature = "rayon"))]
    {
        return serde_json::to_string(&TestResult {
            config: config_list,
            result: texts
                .iter()
                .map(|text| {
                    rules
                        .iter()
                        .map(|rule| rule.test(&text))
                        .collect::<Vec<_>>()
                })
                .collect::<Vec<_>>(),
        })
        .unwrap();
    }
}

#[derive(Serialize, Deserialize)]
struct FixResult {
    config: Vec<String>,
    result: Vec<String>,
}

#[wasm_bindgen]
pub fn fix(param: &str) -> String {
    set_panic_hook();
    let Param { config, texts } = serde_json::from_str(param).unwrap();
    let rules = config::build_rules(config);
    let result = serde_json::to_string(&FixResult {
        config: rules.iter().map(|r| r.id().into()).collect::<Vec<_>>(),
        result: iter(&texts)
            .fold(
                || rules.iter().map(|rule| Rule::clone(rule.borrow())),
                |rules, texts| {
                    rules
                        .iter()
                        .fold(text.clone(), |text, rule| rule.fix(&text))
                },
            )
            .collect::<Vec<_>>(),
    })
    .unwrap();
    result
}

#[cfg(feature = "parallel")]
pub use wasm_bindgen_rayon::init_thread_pool;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_test() {
        let result = test(
            r#"{"texts":["leo你好, world! 10 %", "123.456"],"config":{
            "no_space_around_full_width_punctuation": true,
            "no_space_between_num_dp": true,
            "space_between_ch_en": true,
            "uniform_punctuation": true
        }}"#,
        );
        let expected_result = "{\"config\":[\"space_between_ch_en\",\"no_space_between_num_dp\",\"uniform_punctuation\",\"no_space_around_full_width_punctuation\"],\"result\":[[[[2,4]],[[16,17]],[[5,6],[12,13]],null],[null,null,null,null]]}";
        assert_eq!(result, expected_result);
    }

    #[test]
    fn test_fix() {
        let result = fix(r#"{"texts":["leo你好, world! 10 %", "123.456"],"config":{
            "no_space_around_full_width_punctuation": true,
            "no_space_between_num_dp": true,
            "space_between_ch_en": true,
            "uniform_punctuation": true
        }}"#);
        let expected_result = "{\"config\":[\"space_between_ch_en\",\"no_space_between_num_dp\",\"uniform_punctuation\",\"no_space_around_full_width_punctuation\"],\"result\":[\"leo 你好，world！10%\",\"123.456\"]}";
        assert_eq!(result, expected_result);
    }
}
