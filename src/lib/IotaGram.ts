import * as IOTA from 'iota.lib.js';
import { decode } from 'jsonwebtoken';
import { Observable, Subscription } from 'rxjs';

import { IotaTransactionMonitor } from './IotaTransactionMonitor';

export const CurrentVersion =  1;

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

export class IotaGram extends Subscription {
  public static sanitize(data: IotaGramRequest): IotaGramData {
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
    unsubscribe?: () => void,
  ) {
    super(unsubscribe);

    const iota = new IOTA({
      provider,
    });

    const txMonitor = new IotaTransactionMonitor(
      iota,
      address,
      interval,
    );

    this.datagrams = txMonitor.transactions
      .map(x => {
        const token = iota.utils.fromTrytes(x.signatureMessageFragment.replace(/9+$/, ''));

        const data = decode(token) as IotaGramRequest;

        return IotaGram.sanitize(data);
      })
      .share();

    this.add(txMonitor);
  }
}
