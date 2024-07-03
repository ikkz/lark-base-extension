use wasm_bindgen::prelude::*;

pub(crate) fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

pub(crate) fn vec_to_option<T>(vec: Vec<T>) -> Option<Vec<T>> {
    if vec.is_empty() {
        None
    } else {
        Some(vec)
    }
}

pub(crate) fn byte_range_to_char_range(text: &str, (start, end): (usize, usize)) -> (usize, usize) {
    let begin = utf8_slice::len(&text[0..start]);
    (begin, begin + utf8_slice::len(&text[start..end]))
}

pub(crate) fn prev_next_char(text: &str, index: usize) -> (Option<char>, Option<char>) {
    if index == 0 {
        (None, text.chars().nth(1))
    } else {
        let chars = text.chars().skip(index - 1).take(3).collect::<Vec<_>>();
        (chars.get(0).cloned(), chars.get(2).cloned())
    }
}
