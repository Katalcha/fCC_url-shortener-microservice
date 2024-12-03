require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const clientOptions = { useNewUrlParser: true, useUnifiedTopology: true };
try {
  mongoose.connect(`${process.env.MONGO_PROTOCOL}${process.env.MONGO_USER}${process.env.MONGO_PW}${process.env.MONGO_URI}`, clientOptions);
} catch (err) {
  console.log(err);
} finally {
  mongoose.disconnect();
}

const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: Number
});

const URL = mongoose.model('URL', urlSchema);


const app = express();

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (_, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', (_, res) => {
  res.json({ greeting: 'hello API' });
});

app.get('api/shorturl', (req, res) => {
  res.json({ original_url: "", short_url: "" });
});

app.get('api/shorturl/:short-url', (req, res) => {

});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
