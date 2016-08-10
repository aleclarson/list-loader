
# list-loader v3.1.0 ![stable](https://img.shields.io/badge/stability-stable-4EBA0F.svg?style=flat)

A subclass of [`Loader`](http://github.com/aleclarson/loader) that:

- caches loaded items (if `options.cacheResults` is true)

- prevents duplicate items (if `options.preventDupes` is true)

```coffee
ListLoader = require "list-loader"

loader = ListLoader
  cacheResults: yes # <= Defaults to false
  preventDupes: yes # <= Defaults to false
```

### Properties

```coffee
# The array of cached results.
# Only accessible if `options.cacheResults` is true.
loader.loaded

# The number of cached results.
# Only accessible if `options.cacheResults` is true.
loader.numLoaded

# Equals true if any results are cached.
# Only accessible if `options.cacheResults` is true.
loader.isLoaded
```

### Methods

```coffee
# Returns true if `itemId` has been loaded.
# Only callable if `options.preventDupes` is true.
loader.hasItem itemId

# Calls `load` if no results are loaded/loading.
# Otherwise, the loaded results are returned.
# Only callable if `options.cacheResults` is true.
promise = loader.firstLoad()

# Traverse the loaded results in order.
# Only callable if `options.cacheResults` is true.
loader.forEach (item, index) ->
```
