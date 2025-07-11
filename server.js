const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'NextNote_v4_fixed.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`NextNote server running on http://localhost:${PORT}`);
});
