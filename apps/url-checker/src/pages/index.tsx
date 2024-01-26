/* eslint-disable max-nested-callbacks */
import {
  FieldType,
  IUrlField,
  Selection,
  bitable,
} from '@lark-base-open/js-sdk';
import {
  useObservable,
  useObservableCallback,
  useObservableState,
  useSubscription,
} from 'observable-hooks';
import {
  distinctUntilChanged,
  from,
  fromEventPattern,
  merge,
  of,
  shareReplay,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { Button, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { isEqual } from 'lodash-es';

export default function Home() {
  const table$ = useObservable(() =>
    fromEventPattern<Selection>(
      handler => bitable.base.onSelectionChange(e => handler(e.data)),
      (_, signal) => signal?.(),
    ).pipe(
      startWith(null),
      switchMap(selection =>
        selection?.tableId
          ? of(selection?.tableId)
          : from(bitable.base.getSelection().then(sel => sel.tableId)),
      ),
      distinctUntilChanged(),
      switchMap(tableId =>
        tableId ? from(bitable.base.getTableById(tableId)) : of(null),
      ),
      shareReplay(1),
    ),
  );

  const options$ = useObservable(() =>
    table$.pipe(
      switchMap(table =>
        table
          ? from(table.getFieldListByType<IUrlField>(FieldType.Url)).pipe(
              switchMap(fields =>
                merge(
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
                ).pipe(
                  switchMap(() =>
                    from(table.getFieldListByType<IUrlField>(FieldType.Url)),
                  ),
                  startWith(fields),
                  switchMap(fields =>
                    from(
                      Promise.all(
                        fields.map(async field => ({
                          name: await field.getName(),
                          id: field.id,
                        })),
                      ),
                    ),
                  ),
                ),
              ),
              distinctUntilChanged(isEqual as any),
            )
          : of(null),
      ),
    ),
  );

  const options = useObservableState(options$, null);
  const [setField, field$] = useObservableCallback<string | null>();
  const field = useObservableState(field$, null);

  useSubscription(
    useObservable(() => options$.pipe(withLatestFrom(field$))),
    ([options, field]) => {
      if (!options?.find(({ id }) => id === field)) {
        setField(null);
      }
    },
  );

  const { t } = useTranslation();
  return (
    <div className="p-4">
      <div className="flex">
        <Select
          placeholder={t('select_field')}
          value={field}
          onChange={value => setField(value || null)}
        >
          {options?.map(({ id, name }) => (
            <Select.Option key={id} value={id}>
              {name}
            </Select.Option>
          ))}
        </Select>
        <Button className="ml-3" type="primary">
          {t('check')}
        </Button>
      </div>
    </div>
  );
}
