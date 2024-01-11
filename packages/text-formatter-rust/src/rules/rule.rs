pub(crate) trait Rule {
  fn id(&self) -> &str;
  fn test(&self, text: &str) -> Option<Vec<(usize, usize)>>;
  fn fix(&self, text: &str) -> String;
}
