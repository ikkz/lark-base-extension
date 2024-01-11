import { bitable } from '@lark-base-open/js-sdk';
import * as i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    zh: {
      translation: {
        no_space_around_full_width_punctuation:
          '全角标点与其他字符之间不加空格',
        no_space_between_num_dp: '度数、百分比与数字之间不需要增加空格',
        space_between_ch_en: '中文和英文、数字之间需要增加空格',
        uniform_punctuation: '统一标点符号',
      },
    },
    en: {
      translation: {
        no_space_around_full_width_punctuation:
          'No space between full-width punctuation and other characters',
        no_space_between_num_dp:
          'No space needed between degrees, percentages, and numbers',
        space_between_ch_en:
          'Space needed between Chinese and English, numbers',
        uniform_punctuation: 'Uniform punctuation',
      },
    },
  },
  lng: 'zh',
  fallbackLng: 'zh',

  interpolation: {
    escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  },
});

bitable.bridge.getLanguage().then(i18n.changeLanguage).finally(console.error);

export default i18n;
