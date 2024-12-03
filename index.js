require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (_, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', (_, res) => {
  res.json({ greeting: 'hello API' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
