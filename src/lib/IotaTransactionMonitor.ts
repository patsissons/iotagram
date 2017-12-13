import * as IOTA from 'iota.lib.js';
import {} from 'jsonwebtoken';
import { Observable, Subscription } from 'rxjs';

export class IotaTransactionMonitor extends Subscription {
  public static getTransactions(iota: IOTA, address: string) {
    const wrapped = Observable
      .bindNodeCallback(iota.api.findTransactionObjects);

    return wrapped({
      addresses: [
        address,
      ],
    });
  }

  public readonly transactions: Observable<IOTA.TransactionObject>;

  constructor(
    iota: IOTA,
    address: string,
    interval = 300,
    unsubscribe?: () => void,
  ) {
    super(unsubscribe);

    this.transactions = Observable
      .interval(interval)
      .flatMap(x => {
        return IotaTransactionMonitor.getTransactions(iota, address);
      })
      .flatMap(x => {
        return Observable
          .from(x);
      })
      .share();
  }
}
