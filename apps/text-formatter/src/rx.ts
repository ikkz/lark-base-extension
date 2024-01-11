import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { bitable } from '@lark-base-open/js-sdk';
import isEqual from 'lodash-es/isEqual';
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
