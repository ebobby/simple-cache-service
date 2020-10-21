import express from "express";

const app = express();
const host = "localhost";   // default host
const port = 8080;          // default port to listen

// define a route handler for the default home page
app.get("/", (req, res) => {
  res.send("Hello world!");
});

// start the Express server
app.listen(port, host, () => {
  console.log(`Cache server started at http://localhost:${port}`);
});
