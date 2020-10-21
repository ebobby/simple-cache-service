import Entry from "./entry"

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

  add(key: string, value: any) {
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

    entry = new Entry(key, value);

    // Add entry.
    this.insert(entry);
    // Index entry.
    this._index[entry.key] = entry;
  }

  fetch(key: string) {
    const entry = this._index[key];

    if (entry != null) {
      return entry.value;
    }
  }

  rm(key: string) {
    const entry = this._index[key];

    if (entry !== null) {
      this.remove(entry);
      delete this._index[key];
    }
  }

  toObject() {
    const result: { [key: string]: any } = {};
    let next: Entry = this._top;

    while (next != null) {
      result[next.key] = next.value
      next = next.next;
    }

    return result;
  }

  // Add a cache entry.
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

    // New entries _always_ go on _top.
    this._top = entry;
    this._count++;

    return entry;
  }

  // Remove specified cache entry.
  private remove(entry: Entry) {
    if (entry == null)
      return;

    /// Pluck this entry out.

    // If there's a previous...
    if (entry.previous != null)
      // ...the next for our previous is our next.
      entry.previous.next = entry.next;
    else
      // ...if we don't have a previous we are the _top.
      this._top = entry.next;

    // If there's a next...
    if (entry.next != null)
      // ...the previous for our next is our previous.
      entry.next.previous = entry.previous;
    else
      // ...if we don't have a next we are the _bottom.
      this._bottom = entry.previous;

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
