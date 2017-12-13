import * as IOTA from 'iota.lib.js';
import { Observable } from 'rxjs';

export class IotaTransactionMonitor {
  public readonly transactions: Observable<IOTA.TransactionObject>;

  constructor(
    iota: IOTA,
    address: string,
    interval = 300,
  ) {
    const findTransactionObjects = Observable
      .bindNodeCallback(iota.api.findTransactionObjects);

    this.transactions = Observable
      .interval(interval)
      .flatMap(x => {
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
