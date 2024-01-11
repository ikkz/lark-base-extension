pub(crate) trait Rule: Sync {
    fn id(&self) -> &str;
    fn test(&self, text: &str) -> Option<Vec<(usize, usize)>>;
    fn fix(&self, text: &str) -> String;
}
