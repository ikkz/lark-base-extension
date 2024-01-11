use crate::rules::*;
use serde::{Deserialize, Serialize};
use std::convert::identity;

#[derive(Serialize, Deserialize)]
struct Config {
    no_space_around_full_width_punctuation: Option<bool>,
    no_space_between_num_dp: Option<bool>,
    space_between_ch_en: Option<bool>,
    uniform_punctuation: Option<bool>,
}

pub(crate) fn build_rules(config: &str) -> Vec<Box<dyn Rule>> {
    let config: Config = serde_json::from_str(config).unwrap();
    let mut rules: Vec<Box<dyn Rule>> = vec![];
    let mut register = |rule: Box<dyn Rule>| {
        rules.push(rule);
    };

    if config.space_between_ch_en.is_some_and(identity) {
        register(Box::new(crate::rules::space_between_ch_en::build_rule()));
    }
    if config.no_space_between_num_dp.is_some_and(identity) {
        register(Box::new(crate::rules::no_space_between_num_dp::build_rule()));
    }
    if config.uniform_punctuation.is_some_and(identity) {
        register(Box::new(
            crate::rules::uniform_punctuation::UniformPunctuation,
        ));
    }
    if config
        .no_space_around_full_width_punctuation
        .is_some_and(identity)
    {
        register(Box::new(
            crate::rules::no_space_around_full_width_punctuation::build_rule(),
        ));
    }
    rules
}
