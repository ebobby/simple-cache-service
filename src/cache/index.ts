import Entry from "./entry"

////////////////////////////////////////////////////////////////////////////////
// Basic LRU cache.
//
// Supports:
//  * add(key, value, expires) - O(1) runtime.
//  * rm(key)                  - O(1) runtime.
//  * fetch(key)               - O(1) runtime.
//  * toObject()               - O(n) runtime.
//
////////////////////////////////////////////////////////////////////////////////
export default class Cache {
  _top: Entry;
  _bottom: Entry;
  _index: {
    [key: string]: Entry
  };
  _count: number;
  _maxEntries: number;

  constructor(maxEntries: number) {
    this._maxEntries = maxEntries || 5;
    this._top = null;
    this._bottom = null;
    this._index = {};
    this._count = 0;
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Insert value into the cache with an optional expiry (in ms).
  ////////////////////////////////////////////////////////////////////////////////
  add(key: string, value: any, expires: number) {
    if (key == null) {
      return;
    }

    let entry = this._index[key];

    if (entry != null) {
      // If entry it's already in there, it's a refresh.
      this.remove(entry);
    }
    else {
      // Fresh new entry, evict a value if neccesary (LRU).
      if (this._count === this._maxEntries) {
        this.evict()
      }
    }

    const expiry = (expires || 0 > 0) ? Date.now() + expires : 0;

    // Add the entry and update the index.
    entry = new Entry(key, value, expiry);
    this.insert(entry);
    this._index[entry.key] = entry;

    return value;
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Fetch value from the cache.
  // If it exists, the value is now considered recently used.
  ////////////////////////////////////////////////////////////////////////////////
  fetch(key: string) {
    const entry = this._index[key];

    if (entry != null) {
      this.remove(entry);
      delete this._index[key];

      // If the entry is expired just return.
      if (entry.expires !== 0 && entry.expires <= Date.now()) {
        return;
      }

      // Since this entry is _now_ the most recent one, promote  it to the top.
      // Use existing methods to remove/insert. Runtime performance is still O(1)
      // but we are a bit wasteful with memory allocations.
      const promoted = new Entry(entry.key, entry.value, entry.expires);
      this.insert(promoted);
      this._index[key] = promoted

      return promoted.value;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Remove value from the cache.
  ////////////////////////////////////////////////////////////////////////////////
  rm(key: string) {
    const entry = this._index[key];

    if (entry != null) {
      this.remove(entry);
      delete this._index[key];
      return entry.value;
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  // Return an object representation of the cache key/values.
  ////////////////////////////////////////////////////////////////////////////////
  toObject() {
    const result: { [key: string]: any } = {};
    let next: Entry = this._top;

    while (next != null) {
      result[next.key] = { value: next.value, expires: next.expires }
      next = next.next;
    }

    return result;
  }

  // Insert a cache entry into the entry list.
  private insert(entry: Entry) {
    // If empty, set the _bottom of the list.
    if (this._top == null) {
      this._bottom = entry;
    }
    else {
      // Connect the previous _top to this entry.
      entry.next = this._top;

      // Connect new entry to the next one.
      this._top.previous = entry;
    }

    // New entries _always_ go on top. They are considered recently used.
    this._top = entry;
    this._count++;

    return entry;
  }

  // Remove specified cache entry.
  private remove(entry: Entry) {
    if (entry == null)
      return;

    /// Pluck this entry out:
    // If there's a previous...
    if (entry.previous != null) {
      // ...the next for our previous is our next.
      entry.previous.next = entry.next;
    }
    else {
      // ...if we don't have a previous we are the top.
      this._top = entry.next;
    }

    // If there's a next...
    if (entry.next != null) {
      // ...the previous for our next is our previous.
      entry.next.previous = entry.previous;
    }
    else {
      // ...if we don't have a next we are the bottom.
      this._bottom = entry.previous;
    }

    this._count--;
  }

  // Evict the _bottom entry of the list and return it.
  private evict() {
    if (this._bottom == null)
      return;

    const entry = this._bottom;

    // If we have a previous...
    if (entry.previous != null) {
      // Previous becomes the new _bottom
      entry.previous.next = null
      this._bottom = entry.previous;
    }
    else {
      // We are the _top and the _bottom.
      this._top = null;
      this._bottom = null;
    }

    delete this._index[entry.key];
    this._count--;

    return entry;
  }
}
