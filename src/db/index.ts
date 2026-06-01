import Dexie, { type Table } from 'dexie';

export interface Balances {
  id?: number;
  offline: number;
  online: number;
}

export interface Transaction {
  id?: number;
  type: 'expense' | 'income' | 'transfer_fee' | 'withdraw_direct' | 'withdraw_to_balance';
  category: string;
  description: string;
  amount: number;
  timestamp: number;
  source: 'offline' | 'online' | 'transfer';
  withdrawFrom?: 'investasi' | 'darurat'; // untuk tracking withdraw dari jenis tabungan
}

export interface Savings {
  id?: number;
  investasi: number;
  darurat: number;
  last_saved_timestamp: number;
}

export interface SavingsHistory {
  id?: number;
  type: 'investasi' | 'darurat';
  amount: number;
  date: string; // format: YYYY-MM-DD untuk grouping per hari
  timestamp: number;
}

export interface Target {
  id?: number;
  name: string;
  target_amount: number;
  current_amount: number;
}

class DoonDB extends Dexie {
  balances!: Table<Balances>;
  transactions!: Table<Transaction>;
  savings!: Table<Savings>;
  savingsHistory!: Table<SavingsHistory>;
  targets!: Table<Target>;

  constructor() {
    super('DoonDB');
    this.version(1).stores({
      balances: '++id',
      transactions: '++id, type, category, timestamp, source',
      savings: '++id',
      targets: '++id',
    });
    this.version(2).stores({
      balances: '++id',
      transactions: '++id, type, category, timestamp, source',
      savings: '++id',
      targets: '++id',
    }).upgrade((tx) => {
      return tx.table('transactions').toCollection().modify((t: Record<string, unknown>) => {
        if (!t.description) t.description = '';
      });
    });
    this.version(3).stores({
      balances: '++id',
      transactions: '++id, type, category, timestamp, source',
      savings: '++id',
      savingsHistory: '++id, type, date, timestamp',
      targets: '++id',
    });
  }
}

export const db = new DoonDB();

export async function isDBInitialized(): Promise<boolean> {
  const count = await db.balances.count();
  return count > 0;
}

export async function initializeDB(offline: number, online: number): Promise<void> {
  await db.balances.add({ offline, online });
  await db.savings.add({ investasi: 0, darurat: 0, last_saved_timestamp: Date.now() });
}

export async function getBalances(): Promise<Balances | undefined> {
  return await db.balances.toCollection().first();
}

export async function updateBalances(offline: number, online: number): Promise<void> {
  const existing = await db.balances.toCollection().first();
  if (existing && existing.id) {
    await db.balances.update(existing.id, { offline, online });
  }
}

export async function addTransaction(tx: Omit<Transaction, 'id'>): Promise<void> {
  await db.transactions.add(tx as Transaction);
}

export async function getTransactions(): Promise<Transaction[]> {
  return await db.transactions.toArray();
}

export async function getSavings(): Promise<Savings | undefined> {
  return await db.savings.toCollection().first();
}

export async function updateSavings(investasi: number, darurat: number): Promise<void> {
  const existing = await db.savings.toCollection().first();
  if (existing && existing.id) {
    await db.savings.update(existing.id, { investasi, darurat, last_saved_timestamp: Date.now() });
  }
}

export async function getTargets(): Promise<Target[]> {
  return await db.targets.toArray();
}

export async function addTarget(target: Omit<Target, 'id'>): Promise<void> {
  await db.targets.add(target as Target);
}

export async function updateTarget(id: number, current_amount: number): Promise<void> {
  await db.targets.update(id, { current_amount });
}

export async function deleteTarget(id: number): Promise<void> {
  await db.targets.delete(id);
}

// === Savings History Functions (untuk LIFO tracking) ===
export async function addSavingsHistory(type: 'investasi' | 'darurat', amount: number): Promise<void> {
  const now = Date.now();
  const date = new Date(now).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');
  await db.savingsHistory.add({ type, amount, date, timestamp: now });
}

export async function getSavingsHistory(type: 'investasi' | 'darurat'): Promise<SavingsHistory[]> {
  return await db.savingsHistory.where('type').equals(type).reverse().toArray();
}

// Untuk mendapatkan total savings per hari (untuk LIFO calculation)
export async function getSavingsHistoryByDate(type: 'investasi' | 'darurat', targetDate?: string): Promise<SavingsHistory[]> {
  const dateToQuery = targetDate || new Date().toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-');
  return await db.savingsHistory.where('type').equals(type).and(h => h.date === dateToQuery).toArray();
}

export async function exportDB(): Promise<string> {
  const data = {
    balances: await db.balances.toArray(),
    transactions: await db.transactions.toArray(),
    savings: await db.savings.toArray(),
    savingsHistory: await db.savingsHistory.toArray(),
    targets: await db.targets.toArray(),
  };
  return btoa(JSON.stringify(data));
}

export async function importDB(encoded: string): Promise<void> {
  const data = JSON.parse(atob(encoded));
  await db.transaction('rw', db.balances, db.transactions, db.savings, db.savingsHistory, db.targets, async () => {
    await db.balances.clear();
    await db.transactions.clear();
    await db.savings.clear();
    await db.savingsHistory.clear();
    await db.targets.clear();
    if (data.balances?.length) await db.balances.bulkAdd(data.balances);
    if (data.transactions?.length) await db.transactions.bulkAdd(data.transactions);
    if (data.savings?.length) await db.savings.bulkAdd(data.savings);
    if (data.savingsHistory?.length) await db.savingsHistory.bulkAdd(data.savingsHistory);
    if (data.targets?.length) await db.targets.bulkAdd(data.targets);
  });
}

export async function clearDB(): Promise<void> {
  await db.transaction('rw', db.balances, db.transactions, db.savings, db.savingsHistory, db.targets, async () => {
    await db.balances.clear();
    await db.transactions.clear();
    await db.savings.clear();
    await db.savingsHistory.clear();
    await db.targets.clear();
  });
}
