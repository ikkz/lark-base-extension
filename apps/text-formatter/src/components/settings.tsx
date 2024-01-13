import { useObservableEagerState } from 'observable-hooks';
import { useTranslation } from 'react-i18next';
import { Radio, Checkbox, Form } from '@arco-design/web-react';
import { Mode, config$, mode$ } from '@/rx';
import { CONFIG_LIST, Config } from '@/api';

const CheckboxGroup = Checkbox.Group;

const RadioGroup = Radio.Group;

export const Settings = () => {
  const mode = useObservableEagerState(mode$);
  const config = useObservableEagerState(config$);
  const { t } = useTranslation();
  return (
    <Form>
      <Form.Item label={t('format_target')}>
        <RadioGroup
          value={mode}
          onChange={mode => mode$.next(mode as Mode)}
          className="pr-4"
          direction="vertical"
        >
          <Radio value="cell">{t('cell')}</Radio>
          <Radio value="field">{t('field')}</Radio>
        </RadioGroup>
      </Form.Item>
      <Form.Item label={t('format_rule')}>
        <CheckboxGroup
          options={CONFIG_LIST.map((rule, i) => ({
            value: rule,
            label: `${i + 1}. ${t(rule)}`,
          }))}
          value={Object.keys(config).filter(key => config[key as keyof Config])}
          onChange={rules =>
            config$.next(
              Object.fromEntries(rules.map(rule => [rule, true])) as Config,
            )
          }
          direction="vertical"
        />
      </Form.Item>
    </Form>
  );
};
