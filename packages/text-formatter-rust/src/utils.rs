pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

pub fn vec_to_option<T>(vec: Vec<T>) -> Option<Vec<T>> {
    if vec.is_empty() {
        None
    } else {
        Some(vec)
    }
}

pub fn byte_range_to_char_range(text: &str, byte_range: (usize, usize)) -> (usize, usize) {
    (
        utf8_slice::len(&text[0..byte_range.0]),
        utf8_slice::len(&text[0..byte_range.1]),
    )
}
