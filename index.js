require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', (_, res) => res.sendFile(process.cwd() + '/views/index.html'));

app.get('/api/hello', (_, res) => res.json({ greeting: 'hello API' }));


// MONGO DB APPROACH
const clientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(`${process.env.MONGO_PROTOCOL}${process.env.MONGO_USER}${process.env.MONGO_PW}${process.env.MONGO_URI}`, clientOptions);

const urlSchema = new mongoose.Schema({ original: { type: String, required: true }, short: Number });
const URL = mongoose.model('URL', urlSchema);

// POST VIA MONGODB
app.post('/api/shorturl', bodyParser.urlencoded({ extended: false }), (req, res) => {
  const inputURL = req.body.url;
  let shortInput = 1;
  
  // matching by protocol
  // if not http/s or ws/s return error
  const urlRegex = new RegExp(/^(?!https?|wss?)/gi);
  if (inputURL.match(urlRegex)) {
    res.json({ error: 'Invalid URL' });
    return;
  }

  // query mongodb
  URL.findOne({})
    .sort({short: 'desc'})
    .exec((err, result) => {
      if(!err) {
        // update mongodb
        shortInput = result.short + 1
        URL.findOneAndUpdate({original: inputURL}, {original: inputURL, short: shortInput}, {new: true, upsert: true}, (err, record) => {
          if (!err) {
            res.json({ original_url: inputURL, short_url: record.short })
            return;
          }
        });
      }
    })
});

// GET VIA MONGODB
app.get('/api/shorturl/:input', async (req, res) => {
  const input = req.params.input;
  URL.findOne({short: input}, (err, result) => {
    // if input is found, redirect
    if (!err) {
      res.redirect(result.original)
      return;
    } 
    
    // otherwise return error
    res.json({ error: 'URL not found' });
  })
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));
