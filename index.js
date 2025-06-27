require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));
let urlDatabase = [];
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  let hostname;
  try {
    const parsedUrl = new URL(originalUrl);
    hostname = parsedUrl.hostname;
  } catch {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const shortUrlId = urlDatabase.length + 1;
    urlDatabase.push({ id: shortUrlId, url: originalUrl });

    res.json({
      original_url: originalUrl,
      short_url: shortUrlId
    });
  });
});


app.get('/api/shorturl/:id', (req, res) => {
  const shortUrlId = parseInt(req.params.id);
  const entry = urlDatabase.find(e => e.id === shortUrlId);

  if (!entry) {
    return res.json({ error: 'Short URL not found' });
  }

  res.redirect(entry.url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
