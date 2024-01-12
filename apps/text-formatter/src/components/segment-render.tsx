import { FC, useMemo } from 'react';
import { sortBy } from 'lodash-es';
import { CONFIG_LIST, TestResultItem } from '@/api';

export const SegmentRender: FC<{
  text: string;
  rulesResult: TestResultItem[];
  configs: string[];
}> = ({ text, rulesResult, configs }) => {
  const html = useMemo(() => {
    const tags = sortBy(
      rulesResult.flatMap(
        (item, index) =>
          item?.flatMap(([start, end]) => [
            {
              index: start,
              tag: `<span data-rule="${CONFIG_LIST.findIndex(
                config => config === configs[index],
              )}" class="rule">`,
            },
            {
              index: end,
              tag: '</span>',
            },
          ]) || [],
      ),
      'index',
    ).reverse();
    return tags.reduce(
      (acc, { index, tag }) => acc.slice(0, index) + tag + acc.slice(index),
      text,
    );
  }, [text, rulesResult, configs]);

  // eslint-disable-next-line react/no-danger
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};
