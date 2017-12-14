import * as IOTA from 'iota.lib.js';
import { decode } from 'jsonwebtoken';
import { Observable, Subscription } from 'rxjs';

import { IotaTransactionMonitor } from './IotaTransactionMonitor';

export const CurrentVersion =  1;
export const RGBAPixelSize = 4 * Uint8ClampedArray.BYTES_PER_ELEMENT;

export interface RGBAPixel {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface IotaGramPixelPayload {
  location: Point2D;
  color: RGBAPixel;
}

export enum IotaGramTypes {
  Action,
}

export enum IotaGramActions {
  SetPixel,
}

export type IotaGramTypeNames = keyof typeof IotaGramTypes;
export type IotaGramActionNames = keyof typeof IotaGramActions;
export type IotaGramPayload = IotaGramPixelPayload;

export interface IotaGramData {
  type: IotaGramTypes;
  action: IotaGramActions;
  version: number;
  payload?: IotaGramPayload;
}

export interface IotaGramRequest {
  type?: IotaGramTypes | IotaGramTypeNames;
  action?: IotaGramActions | IotaGramActionNames;
  version?: number;
  payload?: IotaGramPayload;
}

export class IotaGram {
  public static sanitize(data: IotaGramRequest | undefined): IotaGramData | undefined {
    if (data == null) {
      return undefined;
    }

    return {
      type: typeof data.type === 'string' ? IotaGramTypes[data.type] : (data.type || IotaGramTypes.Action),
      action: typeof data.action === 'string' ? IotaGramActions[data.action] : (data.action || IotaGramActions.SetPixel),
      version: data.version || CurrentVersion,
      payload: data.payload,
    };
  }

  public readonly datagrams: Observable<IotaGramData>;

  constructor(
    public provider: string,
    public address: string,
    public publicKey?: string,
    interval?: number,
  ) {
    const iota = new IOTA({
      provider,
    });

    // tslint:disable-next-line no-console
    console.debug(`iota.lib loaded (v${ iota.version })`);

    const txMonitor = new IotaTransactionMonitor(
      iota,
      address,
      interval,
    );

    this.datagrams = txMonitor.transactions
      .map(x => {
        return this.getDataGram(iota, x);
      })
      .filterNull()
      .share();
  }

  protected getDataGram(iota: IOTA, tx: IOTA.TransactionObject) {
    if (tx.signatureMessageFragment == null) {
      return undefined;
    }

    const token = iota.utils.fromTrytes(tx.signatureMessageFragment.replace(/9+$/, ''));

    const data = decode(token) as IotaGramRequest | undefined;

    return IotaGram.sanitize(data);
  }
}
