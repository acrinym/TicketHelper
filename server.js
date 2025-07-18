const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'NextNote-OnyxEdition/NextNote.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`NextNote Onyx Edition server running on http://localhost:${PORT}`);
});
