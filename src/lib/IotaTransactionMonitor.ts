import * as IOTA from 'iota.lib.js';
import { Observable } from 'rxjs';

export class IotaTransactionMonitor {
  public readonly transactions: Observable<IOTA.TransactionObject>;

  constructor(
    iota: IOTA,
    address: string,
    interval = 5 * 60 * 1000,
  ) {
    let findTransactionObjects = Observable
      .bindNodeCallback(iota.api.findTransactionObjects);
    findTransactionObjects = findTransactionObjects.bind(iota.api);

    this.transactions = Observable
      .timer(0, interval)
      .flatMap(() => {
        return findTransactionObjects({
          addresses: [
            address,
          ],
        });
      })
      .flatMap(x => {
        return Observable
          .from(x);
      })
      .share();
  }
}
