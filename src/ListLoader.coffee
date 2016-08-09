
ReactiveList = require "ReactiveList"
assertType = require "assertType"
Promise = require "Promise"
Loader = require "loader"
Type = require "Type"

type = Type "ListLoader"

type.inherits Loader

type.defineOptions
  allowDupes: Boolean.withDefault no
  cacheResults: Boolean.withDefault no

type.defineValues

  _loaded: (options) ->
    return if options.allowDupes
    return Object.create null

  _cache: (options) ->
    return unless options.cacheResults
    return ReactiveList()

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
    throw Error "Cannot call 'hasItem' when 'options.allowDupes' is true!"

  firstLoad: ->
    if @_cache
      return Promise @_cache.array if @_cache.length
      return @_loading if @_loading
      return @load.apply this, arguments
    throw Error "Cannot call 'firstLoad' when 'options.cacheResults' is false!"

  forEach: (iterator) ->
    return @_cache.forEach iterator if @_cache
    throw Error "Cannot call 'forEach' when 'options.cacheResults' is false!"

type.overrideMethods

  __onLoad: (items) ->

    assertType items, Array, "items"

    loaded = @_loaded
    loaded and items = items.filter (item, index) ->
      assertType item.id, String, "items[#{index}].id"
      return no if loaded[item.id]
      loaded[item.id] = yes
      return yes

    items.length and @_cache.append items
    return items

  __onUnload: ->
    @_loaded and @_loaded = Object.create null
    @_cache and @_cache.forEach (item) ->
      item.unload and item.unload()
    return

module.exports = type.build()
