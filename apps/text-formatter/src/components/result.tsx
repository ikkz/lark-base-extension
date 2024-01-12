import { useObservable, useObservableState } from 'observable-hooks';
import {
  Observable,
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
} from '@lark-base-open/js-sdk';
import type { AsyncReturnType } from 'type-fest';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import groupBy from 'lodash-es/groupBy';
import sortBy from 'lodash-es/sortBy';
import { identity } from 'lodash-es';
import { Table, Button } from '@arco-design/web-react';
import { ColumnProps } from '@arco-design/web-react/es/Table';
import { SegmentRender } from './segment-render';
import { config$, mode$, selection$ } from '@/rx';
import { TestResult, test } from '@/api';

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

export const Result = () => {
  return useObservableState(
    useObservable(() =>
      selection$.pipe(
        skip(1),
        filter(sel => Boolean(sel) && sel?.fieldType === FieldType.Text),
        combineLatestWith(mode$, config$),
        switchMap(([sel, mode, config]) => {
          return from(
            mode === 'cell'
              ? sel!.table
                  .getCellValue(sel!.fieldId, sel!.recordId)
                  .then(value => [{ record_id: sel!.recordId, value }])
              : sel!.field.getFieldValueList(''),
          ).pipe(
            map(transformValues),
            switchMap(values =>
              from(
                test({
                  config,
                  texts: values.map(({ text }) => text),
                }),
              ).pipe(
                map(result => ({
                  originTexts: values,
                  result,
                  selection: sel,
                })),
                map(props => <ResultTable key={Date.now()} {...props} />),
              ),
            ),
          );
        }),
      ),
    ),
    null,
  );
};

const ResultTable: FC<{
  result: TestResult;
  selection: typeof selection$ extends Observable<infer T> ? T : never;
  originTexts: { text: string; record_id: string; index: number }[];
}> = ({ result: { result, config }, selection, originTexts }) => {
  const { t } = useTranslation();
  const data = useMemo(
    () =>
      Object.entries(
        groupBy(
          result
            .map((rulesResult, index) => ({
              rulesResult,
              ...originTexts[index],
            }))
            .filter(({ rulesResult }) => rulesResult.some(identity)),
          'record_id',
        ),
      ).map(
        ([recordId, items]) =>
          ({ recordId, segments: sortBy(items, 'index') } as const),
      ),
    [result],
  );
  const columns = useMemo(
    () =>
      [
        {
          title: t('Content'),
          dataIndex: 'segments',
          render: (col, item) => (
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
          title: t('Actions'),
          render: (col, item) => (
            <>
              <Button
                size="mini"
                onClick={() =>
                  bitable.ui.showRecordDetailDialog({
                    tableId: selection!.table.id,
                    recordId: item.recordId,
                    fieldIdList: [selection!.fieldId],
                  })
                }
              >
                {t('View')}
              </Button>
              <Button size="mini" type="primary">
                {t('Fix')}
              </Button>
            </>
          ),
        },
      ] as ColumnProps<(typeof data)[number]>[],
    [t],
  );

  return <Table data={data} columns={columns} rowKey="recordId" />;
};
