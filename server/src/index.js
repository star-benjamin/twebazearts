require('dotenv').config();
const express = require('express');
const cors    = require('cors');
 
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
 
app.use('/api/auth',     require('./routes/auth.routes'));
app.use('/api/artworks', require('./routes/artwork.routes'));
app.use('/api/services', require('./routes/service.routes'));
app.use('/api/admin',    require('./routes/admin.routes'));
 
app.listen(process.env.PORT || 4000, () =>
  console.log(`Server on port ${process.env.PORT || 4000}`)
);