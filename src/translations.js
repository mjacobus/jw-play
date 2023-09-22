const store = require("./store");

function t(key, args = {}) {
  let language = store.get("settings.language", "en");
  let str = require(`../translations/${language}.json`)[key];

  if (!str) {
    throw new Error(`Translation for "${key}" not found`);
  }

  str = str.replace(/%\{([^}]+)\}/g, (match, key) => {
    if (args[key] === undefined) {
      throw new Error(`Missing argument "${key}" for translation "${str}"`);
    }

    return args[key];
  });

  return str;
}

module.exports = t;
