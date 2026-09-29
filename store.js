const supabase = require("./db");
const { newId } = require("./rowMap");

const FIELD_TO_COLUMN = {
  _id: "id",
  id: "id",
  unRead: "unread",
  OTP: "otp",
};

const COLUMN_TO_FIELD = {
  id: "_id",
  unread: "unRead",
  otp: "OTP",
};

function snakeFromCamel(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/_+/g, "_")
    .toLowerCase();
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function fieldNameFromColumn(column) {
  if (COLUMN_TO_FIELD[column]) return COLUMN_TO_FIELD[column];

  const ow = column.match(/^(split_[12])_ow_?agent([12])_(.+)$/);
  if (ow) {
    const rest = ow[3].split("_").map(capitalize).join("");
    return `${ow[1]}_OWAgent${ow[2]}_${rest}`;
  }

  const split = column.match(/^(split[12])_(.+)$/);
  if (split) {
    const rest = split[2].split("_").map(capitalize).join("");
    return `${split[1]}_${rest}`;
  }

  return column.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function columnFor(field, columns) {
  if (FIELD_TO_COLUMN[field] && columns.has(FIELD_TO_COLUMN[field])) {
    return FIELD_TO_COLUMN[field];
  }
  const candidates = [
    snakeFromCamel(field),
    snakeFromCamel(String(field).replace(/OWAgent/g, "Ow_Agent")),
  ];
  return candidates.find((column) => columns.has(column)) || null;
}

function idOf(value) {
  if (value && typeof value === "object") return value._id || value.id || null;
  return value;
}

function compareValues(left, right) {
  const leftDate = Date.parse(left);
  const rightDate = Date.parse(right);
  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
    return leftDate - rightDate;
  }
  return String(left).localeCompare(String(right));
}

function matches(doc, filter) {
  if (!filter || Object.keys(filter).length === 0) return true;
  if (filter.$and) return filter.$and.every((part) => matches(doc, part));
  if (filter.$or) return filter.$or.some((part) => matches(doc, part));

  return Object.entries(filter).every(([key, expected]) => {
    if (key.startsWith("$")) return true;
    const value = doc[key];
    if (expected && typeof expected === "object" && !(expected instanceof RegExp)) {
      if (expected.$regex) {
        const pattern =
          expected.$regex instanceof RegExp
            ? expected.$regex
            : new RegExp(expected.$regex, "i");
        return pattern.test(value == null ? "" : String(value));
      }
      if (expected.$gte !== undefined && compareValues(value, expected.$gte) < 0) {
        return false;
      }
      if (expected.$lte !== undefined && compareValues(value, expected.$lte) > 0) {
        return false;
      }
      if (expected.$gt !== undefined && compareValues(value, expected.$gt) <= 0) {
        return false;
      }
      if (expected.$lt !== undefined && compareValues(value, expected.$lt) >= 0) {
        return false;
      }
      return expected.$gte !== undefined || expected.$lte !== undefined || expected.$gt !== undefined || expected.$lt !== undefined;
    }
    return value === expected;
  });
}

function sortDocs(docs, sort) {
  if (!sort) return docs;
  const [field, direction] = Object.entries(sort)[0];
  return [...docs].sort((left, right) => {
    if (left[field] == null && right[field] == null) return 0;
    if (left[field] == null) return 1;
    if (right[field] == null) return -1;
    const diff = compareValues(left[field], right[field]);
    return direction < 0 ? -diff : diff;
  });
}

function applyUpdate(doc, update) {
  const changes = update || {};
  if (changes.$set) Object.assign(doc, changes.$set);
  if (changes.$inc) {
    for (const [field, amount] of Object.entries(changes.$inc)) {
      doc[field] = (Number(doc[field]) || 0) + Number(amount);
    }
  }
  for (const [field, value] of Object.entries(changes)) {
    if (!field.startsWith("$")) doc[field] = value;
  }
}

class Row {
  constructor(model, data, isNew) {
    Object.assign(this, data);
    if (!this._id) this._id = newId();
    Object.defineProperty(this, "_model", { value: model });
    Object.defineProperty(this, "_isNew", { value: isNew, writable: true });
  }

  save() {
    return this._model.persist(this, this._isNew).then((saved) => {
      Object.assign(this, saved);
      this._isNew = false;
      return this;
    });
  }
}

function createModel(table) {
  let columns = null;

  async function columnSet() {
    if (columns) return columns;
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) throw error;
    columns = new Set(Object.keys((data && data[0]) || {}));
    if (!columns.has("id")) columns.add("id");
    return columns;
  }

  function fromRow(row, knownColumns) {
    if (!row) return null;
    const doc = {};
    for (const [column, value] of Object.entries(row)) {
      doc[fieldNameFromColumn(column)] = value;
    }
    return new Row({ persist }, doc, false);
  }

  function toRow(doc, knownColumns, { includeId }) {
    const row = {};
    for (const [field, value] of Object.entries(doc)) {
      if (typeof value === "function" || value === undefined) continue;
      const column = columnFor(field, knownColumns);
      if (!column || column === "created_at" || column === "updated_at") continue;
      if (column === "id" && !includeId) continue;
      row[column] = value;
    }
    if (includeId) row.id = doc._id;
    return row;
  }

  async function fetchAll() {
    const pageSize = 1000;
    const rows = [];
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .range(from, from + pageSize - 1);
      if (error) throw error;
      rows.push(...(data || []));
      if (!data || data.length < pageSize) break;
      from += pageSize;
    }
    return rows;
  }

  async function load(filter, sort) {
    const knownColumns = await columnSet();
    const docs = (await fetchAll()).map((row) => fromRow(row, knownColumns));
    return sortDocs(docs.filter((doc) => matches(doc, filter)), sort);
  }

  async function persist(doc, isNew) {
    const knownColumns = await columnSet();
    const row = toRow(doc, knownColumns, { includeId: true });
    const query = supabase.from(table);
    const result = isNew
      ? await query.insert(row).select("*").single()
      : await query.update(row).eq("id", doc._id).select("*").maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) return doc;
    return fromRow(result.data, knownColumns);
  }

  function find(filter = {}) {
    const run = (sort) => load(filter, sort);
    const thenable = {
      sort(spec) {
        return run(spec);
      },
      then(onFulfilled, onRejected) {
        return run().then(onFulfilled, onRejected);
      },
      catch(onRejected) {
        return run().catch(onRejected);
      },
    };
    return thenable;
  }

  async function findOne(filter = {}) {
    const docs = await load(filter);
    return docs[0] || null;
  }

  async function findById(id) {
    const knownColumns = await columnSet();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", idOf(id))
      .maybeSingle();
    if (error) throw error;
    return fromRow(data, knownColumns);
  }

  async function findByIdAndUpdate(id, update, options = {}) {
    const existing = await findById(id);
    if (!existing) {
      if (!options.upsert) return null;
      const created = new Row({ persist }, { _id: idOf(id) }, true);
      applyUpdate(created, update);
      return created.save();
    }
    applyUpdate(existing, update);
    return existing.save();
  }

  async function findOneAndUpdate(filter, update, options = {}) {
    const existing = await findOne(filter);
    if (!existing) {
      if (!options.upsert) return null;
      const created = new Row({ persist }, {}, true);
      applyUpdate(created, update);
      if (filter) {
        for (const [field, value] of Object.entries(filter)) {
          if (!field.startsWith("$") && (value == null || typeof value !== "object")) {
            created[field] = value;
          }
        }
      }
      return created.save();
    }
    applyUpdate(existing, update);
    return existing.save();
  }

  async function findByIdAndDelete(id) {
    const existing = await findById(id);
    if (!existing) return null;
    const { error } = await supabase.from(table).delete().eq("id", existing._id);
    if (error) throw error;
    return existing;
  }

  function Model(data) {
    return new Row({ persist }, data || {}, true);
  }

  Model.find = find;
  Model.findOne = findOne;
  Model.findById = findById;
  Model.findByIdAndUpdate = findByIdAndUpdate;
  Model.findOneAndUpdate = findOneAndUpdate;
  Model.findByIdAndDelete = findByIdAndDelete;

  return Model;
}

async function listDocs(table, filter, sort) {
  const query = createModel(table).find(filter || {});
  return sort ? query.sort(sort) : query;
}

async function findDoc(table, filter) {
  return createModel(table).findOne(filter || {});
}

async function findDocById(table, id) {
  return createModel(table).findById(id);
}

async function updateDoc(table, id, update, options) {
  return createModel(table).findByIdAndUpdate(id, update, options);
}

async function updateMatchingDoc(table, filter, update, options) {
  return createModel(table).findOneAndUpdate(filter, update, options);
}

async function deleteDoc(table, id) {
  return createModel(table).findByIdAndDelete(id);
}

async function insertDoc(table, data) {
  const doc = createModel(table)(data);
  return doc.save();
}

async function saveDoc(doc) {
  return doc.save();
}

module.exports = {
  createModel,
  fieldNameFromColumn,
  columnFor,
  matches,
  listDocs,
  findDoc,
  findDocById,
  updateDoc,
  updateMatchingDoc,
  deleteDoc,
  insertDoc,
  saveDoc,
};
