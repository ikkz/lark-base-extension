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
        content: '问题内容',
        view: '查看',
        fix: '修复',
        fix_all: '全部修复',
        actions: '操作',
        refresh: '刷新',
        format_target: '排版范围',
        format_rule: '排版规则',
        text_field_only: '请选择文本类型的字段',
        cell: '选中单元格',
        field: '选中列',
        fixing: '修复中',
        fix_success: '修复成功',
      },
    },
    en: {
      translation: {
        no_space_around_full_width_punctuation:
          'No space around full-width punctuation',
        no_space_between_num_dp:
          'No space needed between numbers and degrees, percentages',
        space_between_ch_en: 'Add space between Chinese and English, numbers',
        uniform_punctuation: 'Uniform punctuation',
        content: 'Content',
        view: 'View',
        fix: 'Fix',
        fix_all: 'Fix All',
        actions: 'Actions',
        refresh: 'Refresh',
        format_target: 'Formatting Scope',
        format_rule: 'Formatting Rules',
        text_field_only: 'Please select text type fields',
        cell: 'Selected Cell',
        field: 'Selected Column',
        fixing: 'Fixing',
        fix_success: 'Fix Successful',
      },
    },
    ja: {
      translation: {
        no_space_around_full_width_punctuation:
          '全角句読点の周りにスペースを入れない',
        no_space_between_num_dp:
          '数字と度数、パーセンテージの間にスペースは不要',
        space_between_ch_en: '中国語と英語、数字の間にスペースを入れる',
        uniform_punctuation: '句読点を統一する',
        content: '内容',
        view: '表示',
        fix: '修正',
        fix_all: 'すべて修正',
        actions: '操作',
        refresh: '更新',
        format_target: '整形範囲',
        format_rule: '整形ルール',
        text_field_only: 'テキストフィールドのみを選択してください',
        cell: '選択したセル',
        field: '選択した列',
        fixing: '修正中',
        fix_success: '修正完了',
      },
    },
  },
  lng: 'zh',
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false,
  },
});

bitable.bridge.getLanguage().then(i18n.changeLanguage).finally(console.error);

export default i18n;
