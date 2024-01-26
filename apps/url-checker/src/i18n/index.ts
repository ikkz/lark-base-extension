import { bitable } from '@lark-base-open/js-sdk';
import * as i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    zh: {
      translation: {
        select_field: '请选择链接字段',
        check: '检查',
      },
    },
    en: {
      translation: {
        select_field: 'Please select a url field',
        check: 'Check',
      },
    },
  },
  lng: 'zh',
  fallbackLng: 'zh',

  interpolation: {
    escapeValue: false,
  },
});

bitable.bridge.getLanguage().then(i18n.changeLanguage).finally(console.error);

export default i18n;
