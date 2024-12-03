require('dotenv').config();
// const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', (_, res) => res.sendFile(process.cwd() + '/views/index.html'));

app.get('/api/hello', (_, res) => res.json({ greeting: 'hello API' }));

// MONGO DB APPROACH
/*
  const clientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
  mongoose.connect(`${process.env.MONGO_PROTOCOL}${process.env.MONGO_USER}${process.env.MONGO_PW}${process.env.MONGO_URI}`, clientOptions);
  const urlSchema = new mongoose.Schema({
    original: { type: String, required: true },
    short: Number
  });
  const URL = mongoose.model('url', urlSchema);
*/

// POST VIA MONGODB
/*
  app.post('/api/shorturl', bodyParser.urlencoded({ extended: false }), (req, res) => {
    const inputURL = req.body.url;
    let shortInput = 1;
    
    // matching by protocol, if not http/s or ws/s return error
    const urlRegex = new RegExp(/^(https?|wss?):\/\/[^\s/$.?#].[^\s]*$/);
    if (!inputURL.match(urlRegex)) {
      res.json({ error: 'Invalid URL' });
      return;
    }

    // query mongodb
    URL.findOne({})
      .sort({short: 'desc'})
      .exec((error, result) => {
        if(!error && result != undefined) {
          shortInput = result.short + 1;
        } 
        if (!error) {
          // update mongodb
          URL.findOneAndUpdate(
            {original: inputURL}, 
            {original: inputURL, short: shortInput}, 
            {new: true, upsert: true}, 
            (err, record) => {
              if (!err) {
                res.json({ original_url: inputURL, short_url: record.short })
              }
            });
        }
      });
  });
*/

// GET VIA MONGODB
/*
  app.get('/api/shorturl/:input', (req, res) => {
    const input = req.params.input;
    
    URL.findOne({short: input}, (error, result) => {
      // if input is found, redirect
      if (!error && result !== undefined) {
        res.redirect(result.original);
        return;
      } 
      
      // otherwise return error
      res.json({ error: 'URL not found' });
    })
  });
*/

// IN-MEMORY APPROACH
const memory = [
  { original_url: "http://localhost:3000", short_url: 0 },
];

// POST VIA IN-MEMORY
app.post('/api/shorturl', bodyParser.urlencoded({ extended: false }), (req, res) => {
  const inputURL = req.body.url;

  // matching by protocol, if not http/s or ws/s return error
  const urlRegex = new RegExp(/^(https?|wss?):\/\/[^\s/$.?#].[^\s]*$/);
  if (!inputURL.match(urlRegex)) {
    res.json({ error: 'Invalid URL' });
    return;
  }

  // if input matches an entry, return entry
  const filterByName = memory.filter((entry) => entry.original === String(inputURL))
  if (filterByName.length > 0) {
    res.json(filterByName[0]);
    return;
  }
  
  // if input don't matches an entry, create new entry and return
  if (filterByName.length === 0) {
    const newEntry = { original_url: inputURL, short_url: memory.length }
    memory.push(newEntry);
    res.json(newEntry);
    return;
  }

  // if anything other happens, return error mesage
  res.json({ error: 'Invalid URL' });
});

// GET VIA IN-MEMORY
app.get('/api/shorturl/:input', (req, res) => {
  const input = req.params.input;

  // if input matches a shorturl in memory, redirect to site
  const filterByURL = memory.filter((entry) => entry.short_url === Number(input))
  if (filterByURL.length > 0) {
    res.redirect(filterByURL[0].original_url);
    return;
  }

  // otherwise return error message
  res.json({ error: "URL not found" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
