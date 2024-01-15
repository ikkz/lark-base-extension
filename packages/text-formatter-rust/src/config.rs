use crate::rules::*;
use serde::{Deserialize, Serialize};
use std::convert::identity;

#[derive(Serialize, Deserialize)]
pub(crate) struct Config {
    no_space_around_full_width_punctuation: Option<bool>,
    no_space_between_num_dp: Option<bool>,
    space_between_ch_en: Option<bool>,
    uniform_punctuation: Option<bool>,
}

pub(crate) fn build_rules(config: Config) -> Vec<Box<dyn Rule>> {
    let mut rules: Vec<Box<dyn Rule>> = vec![];
    let mut register = |rule: Box<dyn Rule>| {
        rules.push(rule);
    };

    if config.space_between_ch_en.is_some_and(identity) {
        register(Box::new(crate::rules::space_between_ch_en::new()));
    }
    if config.no_space_between_num_dp.is_some_and(identity) {
        register(Box::new(crate::rules::no_space_between_num_dp::new()));
    }
    if config.uniform_punctuation.is_some_and(identity) {
        register(Box::new(
            crate::rules::uniform_punctuation::UniformPunctuation::new(),
        ));
    }
    if config
        .no_space_around_full_width_punctuation
        .is_some_and(identity)
    {
        register(Box::new(
            crate::rules::no_space_around_full_width_punctuation::new(),
        ));
    }
    rules
}
