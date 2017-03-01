
ReactiveList = require "ReactiveList"
assertType = require "assertType"
Promise = require "Promise"
Loader = require "loader"
Type = require "Type"

type = Type "ListLoader"

type.inherits Loader

type.defineArgs
  cacheResults: Boolean
  preventDupes: Boolean

type.defineValues

  _cache: (options) ->
    return unless options.cacheResults
    return ReactiveList()

  _loaded: (options) ->
    return unless options.preventDupes
    return Object.create null

type.defineGetters

  loaded: ->
    return @_cache.array if @_cache
    throw Error "Cannot access 'loaded' when 'options.cacheResults' is false!"

  isLoaded: ->
    return @_cache.length > 0 if @_cache
    throw Error "Cannot access 'isLoaded' when 'options.cacheResults' is false!"

  numLoaded: ->
    return @_cache.length if @_cache
    throw Error "Cannot access 'numLoaded' when 'options.cacheResults' is false!"

type.defineMethods

  hasItem: (id) ->
    return @_loaded[id] is yes if @_loaded
    throw Error "Cannot call 'hasItem' when 'options.preventDupes' is false!"

  firstLoad: ->
    if @_cache
      return Promise @_cache.array if @_cache.length
      return @_loading if @_loading
      return @load.apply this, arguments
    throw Error "Cannot call 'firstLoad' when 'options.cacheResults' is false!"

  forEach: (iterator) ->
    return @_cache.forEach iterator if @_cache
    throw Error "Cannot call 'forEach' when 'options.cacheResults' is false!"

type.defineHooks

  __assertUnique: (item, index) ->
    assertType item.id, String, "items[#{index}].id"
    return item.id

type.overrideMethods

  __onLoad: (items) ->

    assertType items, Array, "items"

    if loaded = @_loaded
      assertUnique = @__assertUnique
      items = items.filter (item, index) ->
        id = assertUnique item, index
        return no if loaded[id]
        loaded[id] = yes
        return yes

    @_cache and items.length and @_cache.append items
    return items

  __onUnload: ->
    @_loaded and @_loaded = Object.create null
    @_cache and @_cache.forEach (item) ->
      item.unload and item.unload()
    return

module.exports = type.build()
