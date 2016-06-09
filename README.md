
# list-loader 2.0.0 ![stable](https://img.shields.io/badge/stability-stable-4EBA0F.svg?style=flat)

A subclass of [`Loader`](http://github.com/aleclarson/loader) that iterates over results (checking the `id` property) to prevent duplications.

#### Properties

- `loaded: Immutable.List { get, set }`

#### Methods

- `initialLoad(args...) -> Promise` - Only loads if `loaded` is empty. Returns `undefined` if already loaded.
- `mustLoad(args...) -> Promise` - Only loads if `loaded` is empty. Always returns `loaded`. Retries (with exponential backoff) when loading fails.
