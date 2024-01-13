import { useObservable, useObservableState } from 'observable-hooks';
import {
  BehaviorSubject,
  combineLatestWith,
  filter,
  from,
  map,
  skip,
  switchMap,
} from 'rxjs';
import {
  FieldType,
  IField,
  checkers,
  IOpenSegmentType,
  bitable,
  IOpenCellValue,
} from '@lark-base-open/js-sdk';
import type { AsyncReturnType } from 'type-fest';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import groupBy from 'lodash-es/groupBy';
import sortBy from 'lodash-es/sortBy';
import { identity } from 'lodash-es';
import { Table, Button, Message } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { SegmentRender } from './segment-render';
import { Mode, SelectionInfo, config$, mode$, selection$ } from '@/rx';
import { Config, fix, test } from '@/api';
import i18n from '@/i18n';

type FieldValue = AsyncReturnType<IField['getFieldValueList']>[number];

function transformValues(values: FieldValue[]) {
  return values.flatMap(({ value, record_id }) => {
    if (value && checkers.isSegments(value)) {
      return value
        .map(({ type, text }, index) => ({ type, text, index }))
        .filter(({ type }) => type === IOpenSegmentType.Text)
        .map(({ text, index }) => ({ text, record_id, index }));
    }
    return [];
  });
}

async function formatTest(
  selection: SelectionInfo,
  mode: Mode,
  config: Config,
) {
  refreshing$.next(true);
  const startTime = Date.now();
  const fieldValues = await (mode === 'cell'
    ? selection.table
        .getCellValue(selection.fieldId, selection.recordId)
        .then(value => [{ record_id: selection.recordId, value }])
    : selection.field.getFieldValueList(''));

  const transformedValues = transformValues(fieldValues);

  const testResult = await test({
    config,
    texts: transformedValues.map(({ text }) => text),
  });

  console.log(`formatTest: ${Date.now() - startTime}ms`);
  refreshing$.next(false);
  return {
    config: testResult.config,
    result: Object.entries(
      groupBy(
        testResult.result
          .map((rulesResult, index) => ({
            rulesResult,
            ...transformedValues[index],
          }))
          .filter(({ rulesResult }) => rulesResult.some(identity)),
        'record_id',
      ),
    ).map(
      ([recordId, items]) =>
        ({ recordId, segments: sortBy(items, 'index') } as const),
    ),
  };
}

async function fixCells(
  { table, field, fieldId }: SelectionInfo,
  config: (keyof Config)[],
  key: 'ALL' | string,
) {
  const close = Message.loading({
    duration: 60 * 60 * 1000,
    content: i18n.t('fixing'),
  });
  const fieldValues = await (key !== 'ALL'
    ? table
        .getCellValue(fieldId, key)
        .then(value => [{ record_id: key, value }])
    : field.getFieldValueList(''));
  const transformedValues = transformValues(fieldValues);
  const { result } = await fix({
    config: Object.fromEntries(config.map(rule => [rule, true])) as Config,
    texts: transformedValues.map(({ text }) => text),
  });
  const fieldValuesMap: Record<string, IOpenCellValue | undefined> =
    Object.fromEntries(
      fieldValues.map(({ record_id, value }) => [record_id, value]),
    );
  const updateMap: Record<string, boolean> = {};

  result.forEach((fixed, index) => {
    if (fixed !== transformedValues[index].text) {
      const segments = fieldValuesMap[transformedValues[index].record_id];
      if (segments && checkers.isSegments(segments)) {
        segments[transformedValues[index].index].text = fixed;
      }
      updateMap[transformedValues[index].record_id] = true;
    }
  });
  await Promise.all(
    Object.keys(updateMap).map(recordId => {
      if (updateMap[recordId]) {
        const fieldValue = fieldValuesMap[recordId];
        if (fieldValue) {
          return field.setValue(recordId, fieldValue);
        }
      }
      return Promise.resolve();
    }),
  );
  close();
  refresh$.next(Date.now());
}

type FormatTestResult = AsyncReturnType<typeof formatTest>;

const refresh$ = new BehaviorSubject<number>(0);
const refreshing$ = new BehaviorSubject<boolean>(false);

export const Result = () => {
  return useObservableState(
    useObservable(() =>
      selection$.pipe(
        skip(1),
        filter(sel => Boolean(sel) && sel?.fieldType === FieldType.Text),
        combineLatestWith(mode$, config$, refresh$),
        switchMap(([sel, mode, config]) => {
          return from(formatTest(sel!, mode, config)).pipe(
            map(props => (
              <ResultTable key={Date.now()} {...props} selection={sel!} />
            )),
          );
        }),
      ),
    ),
    null,
  );
};

const ResultTable: FC<FormatTestResult & { selection: SelectionInfo }> = ({
  result,
  config,
  selection,
}) => {
  const { t } = useTranslation();
  const refreshing = useObservableState(refreshing$, false);

  const columns = useMemo(
    () =>
      [
        {
          title: t('content'),
          dataIndex: 'segments',
          render: (_, item) => (
            <div className="whitespace-pre-wrap break-all">
              {item.segments.map(segment => (
                <SegmentRender
                  {...segment}
                  configs={config}
                  key={segment.index}
                />
              ))}
            </div>
          ),
        },
        {
          title: t('actions'),
          render: (_, item) => (
            <div className="whitespace-nowrap">
              <Button
                size="mini"
                className="mr-2"
                onClick={() =>
                  bitable.ui.showRecordDetailDialog({
                    tableId: selection.table.id,
                    recordId: item.recordId,
                  })
                }
              >
                {t('view')}
              </Button>
              <Button
                size="mini"
                type="primary"
                onClick={() => fixCells(selection, config, item.recordId)}
              >
                {t('fix')}
              </Button>
            </div>
          ),
        },
      ] as ColumnProps<FormatTestResult['result'][number]>[],
    [t],
  );

  return (
    <>
      <div className="gap-2 flex justify-end mb-3">
        <Button
          onClick={() => refresh$.next(Date.now())}
          loading={refreshing}
          disabled={refreshing}
        >
          {t('refresh')}
        </Button>
        <Button
          type="primary"
          onClick={() => fixCells(selection, config, 'ALL')}
        >
          {t('fix_all')}
        </Button>
      </div>
      <Table data={result} columns={columns} rowKey="recordId" />
    </>
  );
};
