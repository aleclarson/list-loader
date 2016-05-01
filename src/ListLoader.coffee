
{ isKind, assertType, Void } = require "type-utils"

emptyFunction = require "emptyFunction"
Immutable = require "immutable"
Factory = require "factory"
Loader = require "loader"
define = require "define"
Q = require "q"

module.exports = Factory "ListLoader",

  kind: Loader

  optionTypes:
    transform: [ Function, Void ]

  initValues: ->

    _loadedIds: Object.create null

  initReactiveValues: ->

    loaded: Immutable.List()

  init: (options) ->

    if options.transform?
      define this, "_transform",
        value: options.transform
        enumerable: no

  isItemLoaded: (id) ->
    @_loadedIds[id] is yes

  initialLoad: ->
    return Q.fulfill() if @isLoading or @loaded.size > 0
    @load.apply this, arguments

  mustLoad: ->
    return @_loading if @isLoading
    return Q.fulfill @loaded if @loaded.size > 0
    @initialLoad()
    .then (loaded) ->
      throw Error "Loading aborted!" unless loaded?
      loaded
    .fail (error) ->
      # TODO: Retry logic with exponential backoff

  _transform: emptyFunction.thatReturnsArgument

  _load: -> Q.fulfill []

  _onLoad: (items) ->

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

  _onUnload: ->

    @loaded.forEach (item) ->
      item.unload() if isKind item.unload, Function
      yes

    @loaded = Immutable.List()
    @_loadedIds = Object.create null
