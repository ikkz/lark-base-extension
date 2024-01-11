import { useObservableEagerState } from 'observable-hooks';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Mode, config$, mode$ } from '@/rx';
import { Config } from '@/api';

export const Settings = () => {
  const mode = useObservableEagerState(mode$);
  return (
    <div>
      <div className="flex mb-4">
        <div className="text-sm leading-4 pr-4 shrink-0">格式化范围</div>
        <RadioGroup
          value={mode}
          onValueChange={mode => mode$.next(mode as Mode)}
          className="pr-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cell" id="r1" />
            <Label htmlFor="r1">选中单元格</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="field" id="r2" />
            <Label htmlFor="r2">选中列</Label>
          </div>
        </RadioGroup>
      </div>
      <div className="flex">
        <div className="text-sm leading-4 pr-4 shrink-0">格式化设置</div>
        <div className="flex flex-col gap-2 overflow-x-hidden">
          <RuleCheckBox ruleKey="space_between_ch_en" />
          <RuleCheckBox ruleKey="no_space_around_full_width_punctuation" />
          <RuleCheckBox ruleKey="uniform_punctuation" />
          <RuleCheckBox ruleKey="no_space_between_num_dp" />
        </div>
      </div>
    </div>
  );
};

const RuleCheckBox: FC<{
  ruleKey: keyof Config;
}> = ({ ruleKey }) => {
  const { t } = useTranslation();
  const config = useObservableEagerState(config$);

  return (
    <div className="space-x-2 flex items-center">
      <Checkbox
        id={ruleKey}
        checked={Boolean(config[ruleKey])}
        onCheckedChange={checked =>
          config$.next({
            ...config,
            [ruleKey]: checked,
          })
        }
      />
      <Label
        htmlFor={ruleKey}
        className="text-ellipsis whitespace-nowrap overflow-x-hidden"
      >
        {t(ruleKey)}
      </Label>
    </div>
  );
};
