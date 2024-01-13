/* eslint-disable react/no-array-index-key */
import { FC, useMemo } from 'react';
import Delta from 'quill-delta';
import { Tooltip } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';
import { CONFIG_LIST, TestResultItem } from '@/api';

export const SegmentRender: FC<{
  text: string;
  rulesResult: TestResultItem[];
  configs: string[];
}> = ({ text, rulesResult, configs }) => {
  const { t } = useTranslation();

  const deltas = useMemo(
    () =>
      rulesResult
        .flatMap(
          (item, index) =>
            item?.map(([start, end]) =>
              new Delta().retain(start).retain(end - start, {
                [CONFIG_LIST.indexOf(configs[index])]: true,
              }),
            ) || [],
        )
        .reduce(
          (prev, curr) => prev.compose(curr),
          new Delta([{ insert: text }]),
        ),
    [text, rulesResult, configs],
  );

  return (
    <>
      {deltas.map((op, index) => {
        if (typeof op.insert === 'string') {
          const rules = Object.keys(op.attributes || {})
            .filter(key => op.attributes?.[key])
            .map(key => Number(key));
          if (rules.length) {
            return (
              <Tooltip
                key={index}
                content={rules.map(rule => t(CONFIG_LIST[rule])).join('\n')}
              >
                <span className="bg-red-200 border-b-2 border-red-600 cursor-pointer">
                  {op.insert}
                </span>
              </Tooltip>
            );
          }
          return <span key={index}>{op.insert}</span>;
        }
        return null;
      })}
    </>
  );
};
