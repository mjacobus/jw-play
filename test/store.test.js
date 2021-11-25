const store = require("../src/store");

describe("Store", () => {
  beforeEach(() => {
    store.clear();
  });

  describe("append", () => {
    it("append values", () => {
      store.append("array", "one");
      store.append("array", "two");
      store.append("array", "three");
      store.removeItem("array", "two");

      expect(store.get("array")).toEqual(["one", "three"]);
    });

    it("does not duplicate if unique flag is on", () => {
      store.append("array", "one");
      store.append("array", "two");
      store.append("array", "three");
      store.append("array", "three", { unique: true });
      store.append("array", "two");

      const values = store.get("array");

      expect(values).toEqual(["one", "two", "three", "two"]);
    });
  });

  describe("clear collection", () => {
    it("append values", () => {
      store.append("array", "one");
      store.append("array", "two");
      store.append("array", "three");
      store.clearCollection("array");

      expect(store.get("array")).toEqual([]);
    });
  });

  describe("set", () => {
    it("sets a value", () => {
      store.set("foo", "bar");

      expect(store.get("foo")).toEqual("bar");
    });
  });

  describe("remove", () => {
    it("remove values", () => {
      store.set("foo", "bar");
      store.remove("foo");

      expect(store.get("foo", "nope")).toEqual("nope");
    });
  });
});
