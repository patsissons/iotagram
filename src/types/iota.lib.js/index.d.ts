export = IOTA;

declare class IOTA {
  constructor(settings: {
    provider: string;
    sandbox?: boolean;
    token?: boolean;
  });

  constructor(settings: {
    host: string;
    port: number;
    sandbox?: boolean;
    token?: boolean;
  });

  api: IOTA.IotaApi;
  utils: IOTA.IotaUtils;
  multisig: IOTA.IotaMultisig;
  valid: IOTA.IotaValid;

  version: string;
}

declare namespace IOTA {
  /**
  *  Types
  */

  type Security = 1 | 2 | 3;
  type IOTAUnit = "i" | "Ki" | "Mi" | "Gi" | "Ti" | "Pi";

  /**
  *  Objects
  */

  interface TransactionObject {
    hash: string;
    signatureMessageFragment: string;
    address: string;
    value: number;
    tag: string;
    timestamp: number;
    currentIndex: number;
    lastIndex: number;
    bundle: number;
    trunkTransaction: string;
    branchTransaction: string;
    nonce: string;
  }

  interface TransferObject {
    address: string;
    balance: number;
    keyIndex: number;
    security: Security;
  }

  interface NodeInfo {
    appName: string;
    appVersion: string;
    duration: number;
    jreAvailableProcessors: number;
    jreFreeMemory: number;
    jreMaxMemory: number;
    jreTotalMemory: number;
    latestMilestone: string;
    latestMilestoneIndex: number;
    latestSolidSubtangleMilestone: string;
    latestSolidSubtangleMilestoneIndex: number;
    neighbors: number;
    packetsQueueSize: number;
    time: number;
    tips: number;
    transactionsToRequest: number;
  }

  interface Neighbor {
    address: string;
    numberOfAllTransactions: number;
    numberOfInvalidTransactions: number;
    numberOfNewTransactions: number;
  }

  /**
  *
  *  iota.api
  *
  **/

  interface IriApi {
    getNodeInfo(
      callback: (error: Error, success: NodeInfo) => void,
    ): void;

    getNeighbors(
      callback: (error: Error, neighbors: Array<Neighbor>) => void,
    ): void;

    addNeighbors(
      uris: Array<string>,
      callback: (error: Error, addedNeighbors: number) => void,
    ): void;

    removeNeighbors(
      uris: Array<string>,
      callback: (error: Error, removedNeighbors: Array<number>) => void,
    ): void;

    getTips(
      callback: (error: Error, hashes: Array<string>) => void,
    ): void;

    findTransactions(
      searchValues: Array<string>,
      callback: (error: Error, hashes: Array<string>) => void,
    ): void;

    getTrytes(
      hashes: Array<string>,
      callback: (error: Error, trytes: Array<string>) => void,
    ): void;

    getInclusionStates(
      transactions: Array<string>,
      tips: Array<string>,
      callback: (error: Error, states: Array<boolean>) => void,
    ): void;

    getBalances(
      addresses: Array<string>,
      treshold: number,
      callback: (error: Error, response: {
        balances: Array<number>;
        milestone: string;
        milestoneIndex: number;
        duration: number;
      }) => void,
    ): void;

    getTransactionsToApprove(
      depth: number,
      callback: (error: Error, response: {
        trunkTransaction: string;
        branchTransaction: string;
        duration: number;
      }) => void,
    ): void;

    attachToTangle(
      trunkTransaction: string,
      branchTransaction: string,
      minWeightMagnitude: number,
      trytes: Array<string>,
      callback: (error: Error, trytes: Array<string>) => void,
    ): void;

    interruptAttachingToTangle(
      callback: (error: Error, response: {}) => void,
    ): void;

    broadcastTransactions(
      trytes: Array<string>,
      callback: (error: Error, response: {}) => void,
    ): void;

    storeTransactions(
      trytes: Array<string>,
      callback: (error: Error, response: {}) => void,
    ): void;
  }

  /**
  *
  *  iota.api
  *
  **/

  interface IotaApi extends IriApi {
    getTransactionsObjects(
      hashes: Array<string>,
      callback?: (error: Error, transactions: Array<TransactionObject>) => void,
    ): void;

    findTransactionObjects(
      searchValues: {
        addresses?: Array<string>;
        bundles?: Array<string>;
        tags?: Array<string>;
        approvees?: Array<string>;
      },
      callback?: (error: Error, transactions: Array<TransactionObject>) => void,
    ): void;

    getLatestInclusion(
      hashes: Array<string>,
      callback?: (error: Error, states: Array<boolean>) => void,
    ): void;

    broadcastAndStore(
      trytes: Array<string>,
      callback?: (error: Error, response: {}) => void,
    ): void;

    getNewAddress(
      seed: string,
      options?: {
        index?: number;
        checksum?: boolean;
        total?: number;
        security?: Security;
        returnAll?: boolean;
      },
      callback?: (error: Error, response: string | Array<string>) => void,
    ): void;

    getInputs(
      seed: string,
      options?: {
        start?: number;
        end?: number;
        security?: Security;
        threshold?: boolean;
      },
      callback?: (error: Error, response: {
        inputs: Array<TransferObject>;
      }) => void,
    ): void;

    prepareTransfers(
      seed: string,
      transfers: Array<TransferObject>,
      options?: {
        inputs?: Array<string>;
        address?: string;
        security?: Security;
      },
      callback?: (error: Error, response: {
        trytes: Array<string>;
      }) => void,
    ): void;

    sendTrytes(
      trytes: Array<string>,
      depth: number,
      minWeightMagnitude: number,
      callback?: (error: Error, response: {
        inputs: Array<TransactionObject>;
      }) => void,
    ): void;

    sendTransfer(
      seed: string,
      depth: number,
      minWeightMagnitude: number,
      transfers: Array<TransferObject>,
      options?: {
        inputs: Array<string>;
        address: string;
      },
      callback?: (error: Error, response: {
        inputs: Array<TransactionObject>;
      }) => void,
    ): void;

    replayBundle(
      transactionHash: string,
      depth: number,
      minWeightMagnitude: number,
      callback?: (error: Error, response: {}) => void,
    ): void;

    broadcastBundle(
      transactionHash: string,
      callback?: (error: Error, response: {}) => void,
    ): void;

    getBundle(
      transactionHash: string,
      callback?: (error: Error, bundle: Array<TransactionObject>) => void,
    ): void;

    getTransfers(
      seed: string,
      options?: {
        start?: number;
        end?: number;
        security?: Security;
        inclusionStates?: boolean;
      },
      callback?: (error: Error, transfers: Array<Array<TransactionObject>>) => void,
    ): void;

    getAccountData(
      seed: string,
      options?: {
        start: number;
        end: number;
        security?: Security;
      },
      callback?: (error: Error, response: {
        latestAddress: string;
        addresses: Array<string>;
        transfers: Array<string>;
        inputs: Array<TransferObject>;
        balance: number;
      }) => void,
    ): void;

    isReattachable(
      address: string | Array<string>,
      callback?: (error: Error, response: boolean | Array<boolean>) => void,
    ): void;
  }

  /**
  *
  *  iota.utils
  *
  **/

  interface IotaUtils {
    convertUnits(
      value: number,
      fromUnit: IOTAUnit,
      toUnit: IOTAUnit,
    ): number;

    addChecksum(
      inputValue: string,
      checksumLength: number,
      isAddress: boolean,
    ): string;

    addChecksum(
      inputValue: Array<string>,
      checksumLength: number,
      isAddress: boolean,
    ): Array<string>;

    noChecksum(
      address: string,
    ): string;

    noChecksum(
      address: Array<string>,
    ): Array<string>;

    isValidChecksum(
      addressWithChecksum: string,
    ): boolean;

    transactionObject(
      trytes: string,
    ): TransactionObject;

    transactionTrytes(
      transaction: TransactionObject,
    ): string;

    categorizeTransfers(
      transfers: Array<TransactionObject>,
      addresses: Array<string>,
    ): {
        sent: Array<TransactionObject>;
        received: Array<TransactionObject>;
      };

    toTrytes(
      input: string,
    ): string;

    fromTrytes(
      trytes: string,
    ): string;

    extractJson(
      bundle: Array<string>,
    ): string;

    validateSignatures(
      signedBundle: Array<string>,
      inputAddress: string,
    ): boolean;

    isBundle(
      bundle: Array<TransactionObject>,
    ): boolean;
  }

  /**
  *
  *  iota.multisig
  *
  **/

  interface IotaMultisig {
    getKey(
      seed: string,
      index: number,
      security: Security,
    ): string;

    getDigest(
      seed: string,
      index: number,
      security: Security,
    ): string;

    address(
      digestTrytes: string | Array<string>,
    ): MultisigAddress;

    validateAddress(
      multisigAddress: string,
      digests: Array<string>,
    ): boolean;

    initiateTransfer(
      securitySum: number,
      inputAddress: string,
      remainderAddress: string,
      transfers: Array<TransferObject>,
      callback?: (error: Error, bundle: Array<TransactionObject>) => void,
    ): void;

    addSignature(
      bundleToSign: Array<TransactionObject>,
      inputAddress: string,
      key: string,
      callback?: (error: Error, bundle: Array<TransactionObject>) => void,
    ): void;
  }

  interface MultisigAddress {
    absorb(
      digest: string | Array<string>,
    ): MultisigAddress;

    finalize(): string;
  }

  /**
  *
  *  iota.valid
  *
  **/

  interface IotaValid {
    isAddress(address: string): boolean;

    isTrytes(trytes: string, length?: number): boolean;

    isValue(value: any): boolean;

    isNum(value: any): boolean;

    isHash(hash: any): boolean;

    isTransfersArray(transfers: any): boolean;

    isArrayOfHashes(hashes: any): boolean;

    isArrayOfTrytes(trytes: any): boolean;

    isArrayOfAttachedTrytes(trytes: any): boolean;

    isArrayOfTxObjects(transactions: any): boolean;

    isInputs(inputs: any): boolean;

    isString(string: any): boolean;

    isArray(array: any): boolean;

    isObject(object: any): boolean;

    isUri(uri: any): boolean;
  }
}
