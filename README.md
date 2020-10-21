# Cache server

Basic LRU cache server over HTTP.

By default the server runs on localhost:8080 and has a limit of 5 entries in the cache.

These can be changed in `src/index.ts`.

# API
### POST "/cache"

Add key/value to the cache.

```
 Expected JSON:
{
  key:  string     // key to the data
  data: any        // data to cache
  expires: number? // (optional) amount of ms of duration (10000 = 10 seconds)
}
```

Returns:

- 200 "OK" if successful.
- 406 "BAD" if not successful.

### GET "/cache/:key"

Retrieves value from the cache.

Returns:

- 200 "OK" if successful.
- 404 {}   if not found.

### POST "/cache/:key"

Removes value from the cache.

Returns:

- 200 object if successful.
- 404 {}     if not found.


### GET "/debug"

Get a JSON object representing the values in the cache.

Returns:

- 200 object if successful.
