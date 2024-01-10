mod rules;
mod utils;

use crate::rules::Rule;
use crate::utils::set_panic_hook;

use serde::{Deserialize, Serialize};
use std::{collections::HashMap, convert::identity, iter::FromIterator};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
struct Config {
    no_space_around_full_width_punctuation: Option<bool>,
    no_space_between_num_dp: Option<bool>,
    space_between_ch_en: Option<bool>,
    uniform_punctuation: Option<bool>,
}

fn build_rules(config: &str) -> HashMap<String, Box<dyn Rule>> {
    let config: Config = serde_json::from_str(config).unwrap();
    let mut rules: HashMap<String, Box<dyn Rule>> = HashMap::new();
    let mut register = |rule: Box<dyn Rule>| {
        rules.insert(rule.id().into(), rule);
    };

    if config.space_between_ch_en.is_some_and(identity) {
        register(Box::new(crate::rules::space_between_ch_en::build_rule()));
    }
    if config.no_space_between_num_dp.is_some_and(identity) {
        register(Box::new(crate::rules::no_space_between_num_dp::build_rule()));
    }
    if config
        .no_space_around_full_width_punctuation
        .is_some_and(identity)
    {
        register(Box::new(
            crate::rules::no_space_around_full_width_punctuation::build_rule(),
        ));
    }
    if config.uniform_punctuation.is_some_and(identity) {
        register(Box::new(
            crate::rules::uniform_punctuation::UniformPunctuation,
        ));
    }
    rules
}

type TextList = Vec<Vec<String>>;

#[wasm_bindgen]
pub fn test(text_list: &str, config: &str) -> String {
    set_panic_hook();
    let text_list: TextList = serde_json::from_str(text_list).unwrap();
    let rules = build_rules(config);
    serde_json::to_string::<HashMap<&String, HashMap<&String, Option<Vec<(usize, usize)>>>>>(
        &HashMap::from_iter(text_list.iter().map(|v| {
            match v.as_slice() {
                [text_id, text] => (
                    text_id,
                    HashMap::from_iter(
                        rules
                            .iter()
                            .map(|(rule_id, rule)| (rule_id, rule.test(text))),
                    ),
                ),
                _ => panic!("Invalid text list format"),
            }
        })),
    )
    .unwrap()
}
