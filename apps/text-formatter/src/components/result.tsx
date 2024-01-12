import { useObservable, useSubscription } from 'observable-hooks';
import { combineLatestWith, filter, from, map, skip, switchMap } from 'rxjs';
import {
  FieldType,
  IField,
  checkers,
  IOpenSegmentType,
} from '@lark-base-open/js-sdk';
import type { AsyncReturnType } from 'type-fest';
import { config$, mode$, selection$ } from '@/rx';
import { test } from '@/api';

type FieldValue = AsyncReturnType<IField['getFieldValueList']>[number];

function transformValues(values: FieldValue[]) {
  return values.flatMap(({ value, record_id }) => {
    if (value && checkers.isSegments(value)) {
      return value
        .filter(({ type }) => type === IOpenSegmentType.Text)
        .map(({ text }) => ({ text, record_id }));
    }
    return [];
  });
}

export const Result = () => {
  const result$ = useObservable(() =>
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
            ),
          ),
        );
      }),
    ),
  );

  useSubscription(result$, console.log);

  return null;
};
