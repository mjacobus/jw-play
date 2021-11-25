const Store = require("electron-store");
const _ = require("lodash");

const name = process.env.NODE_ENV === "test" ? "config_test" : "config";
const store = new Store({ name });

function clear() {
  return store.clear();
}

function get(key, defaultValue) {
  return store.get(key, defaultValue);
}

function set(key, value) {
  return store.set(key, value);
}

function append(key, value, config = { unique: false }) {
  const array = store.get(key, []);
  if (config.unique && _.includes(array, value)) {
    return store.set(key, array);
  }
  array.push(value);
  return store.set(key, array);
}

function removeItem(key, itemToRemove) {
  const items = get(key, []);
  const remainingItems = _.filter(items, (item) => itemToRemove !== item);
  return set(key, remainingItems);
}

function remove(key) {
  return store.delete(key);
}

function clearCollection(key) {
  return store.set(key, []);
}

module.exports = {
  get,
  set,
  append,
  removeItem,
  clear,
  remove,
  clearCollection,
};
