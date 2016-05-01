
{ isKind, assertType, Void } = require "type-utils"

emptyFunction = require "emptyFunction"
Immutable = require "immutable"
Loader = require "loader"
define = require "define"
Type = require "Type"
Q = require "q"

type = Type "ListLoader"

type.inherits Loader

type.optionTypes =
  transform: Function.Maybe

type.optionDefaults =
  transform: emptyFunction.thatReturnsArgument

type.defineValues

  _transform: (options) -> options.transform

  _loadedIds: -> Object.create null

type.defineReactiveValues

  loaded: -> Immutable.List()

type.defineMethods

  isItemLoaded: (id) ->
    @_loadedIds[id] is yes

  initialLoad: ->
    return Q.fulfill() if @isLoading or @loaded.size > 0
    @load.apply this, arguments

  mustLoad: ->
    return @_loading if @isLoading
    return Q.fulfill @loaded if @loaded.size > 0

    @initialLoad.apply this, arguments
    .then (loaded) ->
      throw Error "Loading aborted!" unless loaded?
      loaded

type.overrideMethods

  __onLoad: (items) ->

    assertType items, Array
    loaded = []

    for item in items
      continue unless isKind item, Object
      assertType item.id, String
      continue if @isItemLoaded item.id
      @_loadedIds[item.id] = yes
      loaded.push item

    loaded = @_transform loaded
    assertType loaded, [ Array, Void ]

    if loaded?.length
      @loaded = @loaded.concat loaded
      @didLoad.emit loaded

    return loaded

  __onUnload: ->

    @loaded.forEach (item) ->
      item.unload() if isKind item.unload, Function
      yes

    @loaded = Immutable.List()
    @_loadedIds = Object.create null

module.exports = type.build()
