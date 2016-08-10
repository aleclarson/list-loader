var Loader, Promise, ReactiveList, Type, assertType, type;

ReactiveList = require("ReactiveList");

assertType = require("assertType");

Promise = require("Promise");

Loader = require("loader");

Type = require("Type");

type = Type("ListLoader");

type.inherits(Loader);

type.defineOptions({
  cacheResults: Boolean.withDefault(false),
  preventDupes: Boolean.withDefault(false)
});

type.defineValues({
  _cache: function(options) {
    if (!options.cacheResults) {
      return;
    }
    return ReactiveList();
  },
  _loaded: function(options) {
    if (!options.preventDupes) {
      return;
    }
    return Object.create(null);
  }
});

type.defineGetters({
  loaded: function() {
    if (this._cache) {
      return this._cache.array;
    }
    throw Error("Cannot access 'loaded' when 'options.cacheResults' is false!");
  },
  isLoaded: function() {
    if (this._cache) {
      return this._cache.length > 0;
    }
    throw Error("Cannot access 'isLoaded' when 'options.cacheResults' is false!");
  },
  numLoaded: function() {
    if (this._cache) {
      return this._cache.length;
    }
    throw Error("Cannot access 'numLoaded' when 'options.cacheResults' is false!");
  }
});

type.defineMethods({
  hasItem: function(id) {
    if (this._loaded) {
      return this._loaded[id] === true;
    }
    throw Error("Cannot call 'hasItem' when 'options.preventDupes' is false!");
  },
  firstLoad: function() {
    if (this._cache) {
      if (this._cache.length) {
        return Promise(this._cache.array);
      }
      if (this._loading) {
        return this._loading;
      }
      return this.load.apply(this, arguments);
    }
    throw Error("Cannot call 'firstLoad' when 'options.cacheResults' is false!");
  },
  forEach: function(iterator) {
    if (this._cache) {
      return this._cache.forEach(iterator);
    }
    throw Error("Cannot call 'forEach' when 'options.cacheResults' is false!");
  }
});

type.defineHooks({
  __assertUnique: function(item, index) {
    assertType(item.id, String, "items[" + index + "].id");
    return item.id;
  }
});

type.overrideMethods({
  __onLoad: function(items) {
    var assertUnique, loaded;
    assertType(items, Array, "items");
    if (loaded = this._loaded) {
      assertUnique = this.__assertUnique;
      items = items.filter(function(item, index) {
        var id;
        id = assertUnique(item, index);
        if (loaded[id]) {
          return false;
        }
        loaded[id] = true;
        return true;
      });
    }
    this._cache && items.length && this._cache.append(items);
    return items;
  },
  __onUnload: function() {
    this._loaded && (this._loaded = Object.create(null));
    this._cache && this._cache.forEach(function(item) {
      return item.unload && item.unload();
    });
  }
});

module.exports = type.build();

//# sourceMappingURL=map/ListLoader.map
