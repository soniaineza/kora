'use strict';

/**
 * In-memory fake of the Supabase PostgREST query builder.
 *
 * Supports the subset of the chain used by the models:
 *   select/insert/upsert/update/delete, eq/neq/lt/lte/gt/gte,
 *   order/limit/range, single/maybeSingle.
 *
 * Tables are keyed by name inside a store you can inspect in tests
 * (e.g. `db._stores.otp_codes.rows`).
 */

class FakeTable {
  constructor(store, name) {
    this.store = store;
    this.name = name;
  }

  select(cols) {
    return new FakeBuilder(this, { op: 'select', cols });
  }

  insert(rows) {
    return new FakeBuilder(this, { op: 'insert', rows });
  }

  upsert(rows) {
    return new FakeBuilder(this, { op: 'upsert', rows });
  }

  update(values) {
    return new FakeBuilder(this, { op: 'update', values });
  }

  delete() {
    return new FakeBuilder(this, { op: 'delete' });
  }
}

class FakeBuilder {
  constructor(table, state) {
    this.table = table;
    this.state = state;
    this.filters = [];
    this.orderBy = null;
    this.orderAscending = true;
    this.limitCount = null;
    this.rangeStart = null;
    this.rangeEnd = null;
  }

  eq(col, val) { this.filters.push(['eq', col, val]); return this; }
  neq(col, val) { this.filters.push(['neq', col, val]); return this; }
  lt(col, val) { this.filters.push(['lt', col, val]); return this; }
  lte(col, val) { this.filters.push(['lte', col, val]); return this; }
  gt(col, val) { this.filters.push(['gt', col, val]); return this; }
  gte(col, val) { this.filters.push(['gte', col, val]); return this; }
  order(col, opts) {
    this.orderBy = col;
    this.orderAscending = !(opts && opts.ascending === false);
    return this;
  }
  limit(n) { this.limitCount = n; return this; }
  range(a, b) { this.rangeStart = a; this.rangeEnd = b; return this; }
  select(cols) { this.state.cols = cols; return this; }

  matches(row) {
    for (const [op, col, val] of this.filters) {
      const rv = row[col];
      switch (op) {
        case 'eq': if (rv !== val) return false; break;
        case 'neq': if (rv === val) return false; break;
        case 'lt': if (!(rv < val)) return false; break;
        case 'lte': if (!(rv <= val)) return false; break;
        case 'gt': if (!(rv > val)) return false; break;
        case 'gte': if (!(rv >= val)) return false; break;
      }
    }
    return true;
  }

  applyOutput(rows) {
    let out = [...rows];
    if (this.orderBy) {
      out.sort((a, b) => {
        const av = a[this.orderBy];
        const bv = b[this.orderBy];
        if (av < bv) return this.orderAscending ? -1 : 1;
        if (av > bv) return this.orderAscending ? 1 : -1;
        return 0;
      });
    }
    if (this.rangeStart != null) out = out.slice(this.rangeStart, this.rangeEnd + 1);
    if (this.limitCount != null) out = out.slice(0, this.limitCount);
    return out;
  }

  pick(row, cols) {
    if (!cols || cols === '*') return row;
    const fields = Array.isArray(cols) ? cols : String(cols).split(',').map((c) => c.trim());
    const out = {};
    for (const f of fields) out[f] = row[f];
    return out;
  }

  async exec() {
    const { op, rows, values, cols } = this.state;
    const rowArray = Array.isArray(rows) ? rows : rows ? [rows] : [];
    try {
      if (op === 'select') {
        let out = this.table.store.rows.filter((r) => this.matches(r));
        out = this.applyOutput(out);
        return { data: out.map((r) => this.pick(r, cols)), error: null };
      }
      if (op === 'insert') {
        const inserted = [];
        for (const row of rowArray) {
          const newRow = { ...row };
          if (!newRow.id) newRow.id = `id_${this.table.store.nextId++}`;
          newRow.created_at = newRow.created_at || new Date().toISOString();
          newRow.updated_at = newRow.updated_at || new Date().toISOString();
          this.table.store.rows.push(newRow);
          inserted.push(newRow);
        }
        return { data: inserted, error: null };
      }
      if (op === 'upsert') {
        const out = [];
        for (const row of rows || []) {
          const idx = this.table.store.rows.findIndex((r) => r.id === row.id);
          const newRow = { ...row, updated_at: new Date().toISOString() };
          if (idx >= 0) {
            this.table.store.rows[idx] = { ...this.table.store.rows[idx], ...newRow };
          } else {
            if (!newRow.id) newRow.id = `id_${this.table.store.nextId++}`;
            newRow.created_at = newRow.created_at || new Date().toISOString();
            this.table.store.rows.push(newRow);
          }
          out.push(this.table.store.rows[idx >= 0 ? idx : this.table.store.rows.length - 1]);
        }
        return { data: out, error: null };
      }
      if (op === 'update') {
        const out = [];
        for (const row of this.table.store.rows) {
          if (this.matches(row)) {
            const updated = { ...row, ...values, updated_at: new Date().toISOString() };
            Object.assign(row, updated);
            out.push(updated);
          }
        }
        return { data: out, error: null };
      }
      if (op === 'delete') {
        this.table.store.rows = this.table.store.rows.filter((r) => !this.matches(r));
        return { data: null, error: null };
      }
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  }

  async single() {
    const r = await this.exec();
    return { data: r.data && r.data.length ? r.data[0] : null, error: r.error };
  }

  async maybeSingle() {
    const r = await this.exec();
    return { data: r.data && r.data.length ? r.data[0] : null, error: r.error };
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

function createFakeSupabase() {
  const stores = {};
  const db = {
    from(table) {
      if (!stores[table]) stores[table] = { rows: [], nextId: 1 };
      return new FakeTable(stores[table], table);
    },
    reset() {
      for (const key of Object.keys(stores)) stores[key].rows = [];
    },
  };
  db._stores = stores;
  return db;
}

module.exports = { createFakeSupabase };
