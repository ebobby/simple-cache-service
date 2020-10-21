import express from "express";
import Cache from "./cache";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const host = "localhost";   // default host
const port = 8080;          // default port to listen
const cacheSize = 5         // default cache size

const cache = new Cache(cacheSize);

function logger(msg: string, severity: string = "INFO") {
  console.log(`${Date.now()} - [CacheServer] [${severity}] : ${msg}`)
}

////////////////////////////////////////////////////////////////////////////////
// Add key/value to the cache.
//
// Expected JSON:
//  - key     - key to the data
//  - data    - data to cache
//  - expires - (optional) amount of ms of duration (10000 = 10 seconds)
////////////////////////////////////////////////////////////////////////////////
app.post("/cache", (req, res) => {
  const { key, data, expires } = req.body;

  if (cache.add(key, data, expires)) {
    logger(`Added ${key} => ${JSON.stringify(data)}, expires in: ${expires || 'never'} (ms).`)
    res.send("OK");
  }
  else {
    logger(`Failed to add key: ${key}.`, "WARN")
    res.status(406).send("BAD");
  }
});

////////////////////////////////////////////////////////////////////////////////
// Retrieve value from the  cache.
////////////////////////////////////////////////////////////////////////////////
app.get("/cache/:key", (req, res) => {
  const { key } = req.params;

  logger(`Fetching: ${key}.`);
  const data = cache.fetch(key);

  if (data) {
    res.send(data);
  }
  else {
    res.status(404).send({});
  }
});

////////////////////////////////////////////////////////////////////////////////
// Remove key/value from the cache.
////////////////////////////////////////////////////////////////////////////////
app.post("/cache/:key", (req, res) => {
  const { key } = req.params;

  const data = cache.rm(key);
  if (data) {
    logger(`Removed ${key} => ${JSON.stringify(data)}.`)
    res.send("OK");
  }
  else {
    logger(`Couldn't remove key: ${key}.`, "WARN")
    res.status(404).send({});
  }
});

////////////////////////////////////////////////////////////////////////////////
// Debug end point.
////////////////////////////////////////////////////////////////////////////////
app.get("/debug", (req, res) => {
  logger(`Sending debug information.`);
  res.send(cache.toObject());
});

// Start the cache server.
app.listen(port, host, () => {
  logger(`Cache server started at http://${host}:${port}`);
});
