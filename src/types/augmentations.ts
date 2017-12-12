// we can disable shadowed variables here since we are performing type augmentations
// tslint:disable no-shadowed-variable

import { Observable } from 'rxjs/Observable';

export function filterNull<T>(
  this: Observable<T | undefined | null>,
  callbackfn?: (value: T, index: number) => boolean,
): Observable<T> {
  return (<Observable<T>>this)
    .filter((x, i) => {
      if (x == null) {
        return false;
      }

      return callbackfn == null ? true : callbackfn(x, i);
    });
}

declare module 'rxjs/Observable' {
  interface Observable<T> {
    filterNull: typeof filterNull;
  }
}

Observable.prototype.filterNull = filterNull;
