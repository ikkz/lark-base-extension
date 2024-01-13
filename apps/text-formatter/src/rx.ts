/* eslint-disable max-nested-callbacks */
import {
  BehaviorSubject,
  distinctUntilChanged,
  from,
  fromEventPattern,
  startWith,
  switchMap,
  merge,
  map,
  Observable,
  combineLatest,
  catchError,
  of,
  share,
} from 'rxjs';
import {
  bitable,
  FieldType,
  Selection,
  ToastType,
} from '@lark-base-open/js-sdk';
import isEqual from 'lodash-es/isEqual';
import pick from 'lodash-es/pick';
import { Config, DEFAULT_CONFIG } from './api';

export type Mode = 'cell' | 'field';

export const mode$ = new BehaviorSubject<Mode>('cell');
bitable.bridge
  .getData('mode')
  .then(mode => {
    if (mode) {
      mode$.next(mode as Mode);
    }
  })
  .catch(console.error)
  .finally(() =>
    mode$.pipe(distinctUntilChanged()).subscribe(mode => {
      bitable.bridge.setData('mode', mode).catch(console.error);
    }),
  );

export const config$ = new BehaviorSubject<Config>(DEFAULT_CONFIG);
bitable.bridge
  .getData('config')
  .then(config => {
    if (config) {
      config$.next(config as Config);
    }
  })
  .catch(console.error)
  .finally(() =>
    config$.pipe(distinctUntilChanged(isEqual)).subscribe(config => {
      bitable.bridge.setData('config', config).catch(console.error);
    }),
  );

export const userSelection$: Observable<Selection> = from(
  bitable.base.getSelection(),
).pipe(
  switchMap(selection =>
    fromEventPattern<Selection>(
      handler => bitable.base.onSelectionChange(({ data }) => handler(data)),
      (_, signal) => signal(),
    ).pipe(startWith(selection)),
  ),
  distinctUntilChanged(isEqual),
);

export const selection$ = userSelection$.pipe(
  map(({ tableId }) => tableId),
  distinctUntilChanged(),
  switchMap(tableId =>
    from(bitable.base.getTableById(tableId!)).pipe(
      switchMap(table =>
        merge([
          fromEventPattern(
            handler => table.onFieldAdd(handler),
            (_, signal) => signal(),
          ),
          fromEventPattern(
            handler => table.onFieldModify(handler),
            (_, signal) => signal(),
          ),
          fromEventPattern(
            handler => table.onFieldDelete(handler),
            (_, signal) => signal(),
          ),
        ]).pipe(
          switchMap(() =>
            combineLatest([
              from(table.getFieldList()),
              userSelection$.pipe(
                map(({ fieldId, recordId }) => ({ fieldId, recordId })),
                distinctUntilChanged(),
              ),
            ]).pipe(
              switchMap(([fieldList, { fieldId, recordId }]) => {
                const field = fieldList.find(({ id }) => id === fieldId);
                return field && fieldId && recordId
                  ? from(field.getType()).pipe(
                      map(type => ({
                        field,
                        table,
                        fieldType: type,
                        fieldId,
                        recordId,
                      })),
                      startWith(null),
                    )
                  : of(null);
              }),
              startWith(null),
            ),
          ),
          startWith(null),
        ),
      ),
      catchError(() => of(null)),
      startWith(null),
    ),
  ),
  distinctUntilChanged((p, c) =>
    isEqual(
      pick(p, ['fieldType', 'fieldId', 'recordId']),
      pick(c, ['fieldType', 'fieldId', 'recordId']),
    ),
  ),
  share(),
);

selection$.subscribe(cell => {
  if (cell && cell.fieldType !== FieldType.Text) {
    bitable.ui.showToast({
      toastType: ToastType.warning,
      message: '请选择文本类型的字段',
    });
  }
});

export type SelectionInfo = NonNullable<
  typeof selection$ extends Observable<infer T> ? T : never
>;
