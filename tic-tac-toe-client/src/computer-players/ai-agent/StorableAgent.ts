export interface BrainStatistics {
  draws: number;
  losses: number;
  wins: number;
}

export interface StorableAgent<BrainType extends BrainStatistics> {
  version: number;
  brain: BrainType;
}

interface Persister {
  store<BrainType extends BrainStatistics>(
    id: string,
    data: Readonly<StorableAgent<BrainType>>,
  ): Promise<void>;
  load<BrainType extends BrainStatistics>(
    id: string,
  ): Promise<StorableAgent<BrainType> | undefined>;
}

interface DatabaseInitializationCallback {
  (database?: Readonly<IDBDatabase>, error?: Readonly<Error>): void;
}

const indexedDBConfiguration = {
  database: 'tic-tac-toe-agents',
  objectStore: 'agents',
  version: 1,
};

const persisterInitialization = new Promise<Persister>((resolve) => {
  initializeDatabase((database, error) => {
    if (database === undefined || error) {
      if (localStorageIsAccessible()) {
        resolve(createLocalStoragePersister());
      } else {
        resolve(createTransientInMemoryPersister());
      }
    } else {
      resolve(createIndexedDBPersister(database));
    }
  });
});

function createTransaction(
  database: Readonly<IDBDatabase>,
  readOnly: boolean,
  transactionResolve?: Function,
  transactionReject?: Function,
): IDBTransaction {
  const dbTransaction = database.transaction(
    [indexedDBConfiguration.objectStore],
    readOnly ? 'readonly' : 'readwrite',
  );

  if (transactionResolve) {
    dbTransaction.oncomplete = () => {
      transactionResolve();
    };
  }

  if (transactionReject) {
    dbTransaction.onerror = () => {
      const { error } = dbTransaction;
      transactionReject(new Error('transaction failed', { cause: error }));
    };
  }

  return dbTransaction;
}

function createIndexedDBPersister(database: Readonly<IDBDatabase>): Persister {
  return {
    store(id, data) {
      return new Promise((storeResolve, storeReject) => {
        createTransaction(database, false, storeResolve, storeReject)
          .objectStore(indexedDBConfiguration.objectStore)
          .put(data, id);
      });
    },
    async load(id) {
      return new Promise((loadResolve, loadReject) => {
        const request = createTransaction(database, false, undefined, loadReject)
          .objectStore(indexedDBConfiguration.objectStore)
          .get(id);

        request.onsuccess = () => {
          loadResolve(request.result);
        };

        request.onerror = () => {
          loadReject(new Error(request.error?.message));
        };
      });
    },
  };
}

function initializeDatabase(callback: DatabaseInitializationCallback): void {
  if (!window.indexedDB || !window.indexedDB.open) {
    callback(undefined, new Error('indexedDB not supported'));
    return;
  }

  const dbOpenRequest = window.indexedDB.open(
    indexedDBConfiguration.database,
    indexedDBConfiguration.version,
  );

  if (!dbOpenRequest) {
    callback(undefined, new Error('failed to open indexedDB database'));
    return;
  }

  dbOpenRequest.onerror = () => {
    callback(undefined, new Error(dbOpenRequest.error?.message));
  };

  dbOpenRequest.onupgradeneeded = (event) => {
    if (event.oldVersion < 1) {
      dbOpenRequest.result.createObjectStore(indexedDBConfiguration.objectStore);
    }
  };

  dbOpenRequest.onsuccess = () => {
    callback(dbOpenRequest.result);
  };
}

function localStorageIsAccessible(): boolean {
  const dummyKey = 'dummy';
  try {
    localStorage.setItem(dummyKey, dummyKey);
    localStorage.removeItem(dummyKey);
  } catch {
    return false;
  }
  return true;
}

function createLocalStoragePersister(): Persister {
  return {
    async store(id, data) {
      const jsonData = JSON.stringify(data);
      localStorage.setItem(id, jsonData);
    },
    async load(id) {
      const stored = localStorage.getItem(id);
      if (!stored) {
        return undefined;
      }
      return JSON.parse(stored);
    },
  };
}

function createTransientInMemoryPersister(): Persister {
  const memory: Record<string, StorableAgent<any>> = {};
  return {
    async store(id, data) {
      memory[id] = data;
    },
    async load(id) {
      return memory[id];
    },
  };
}

export async function persistAgent<BrainType extends BrainStatistics>(
  id: string,
  version: number,
  brain: Readonly<BrainType>,
): Promise<void> {
  const persister = await persisterInitialization;
  return persister.store<BrainType>(id, {
    version,
    brain,
  });
}

export async function loadAgent<BrainType extends BrainStatistics>(
  id: string,
  version: number,
  defaultBrain?: Readonly<BrainType>,
): Promise<BrainType | undefined> {
  const persister = await persisterInitialization;
  const stored = await persister.load<BrainType>(id);
  if (stored && stored.version === version && stored.brain) {
    return stored.brain;
  }
  return defaultBrain;
}
