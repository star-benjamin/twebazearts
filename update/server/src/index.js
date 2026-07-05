require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors({
  origin: [
    'https://twebazearts.online',
    'https://www.twebazearts.online',
  ],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/artworks',     require('./routes/artwork.routes'));
app.use('/api/artists',      require('./routes/artist.routes'));
app.use('/api/inquiries',    require('./routes/inquiry.routes'));
app.use('/api/commissions',  require('./routes/commission.routes'));
app.use('/api/projects',     require('./routes/project.routes'));
app.use('/api/classes',      require('./routes/class.routes'));
app.use('/api/testimonials', require('./routes/testimonial.routes'));
app.use('/api/blog',         require('./routes/blog.routes'));
app.use('/api/payments',     require('./routes/payment.routes'));
app.use('/api/admin',        require('./routes/admin.routes'));

// NOTE: /api/services has been removed — the old freeform "services" concept
// from the artist-marketplace build has no equivalent in the SRS. Its
// closest replacements are /api/commissions (Module 4) and /api/classes
// (Module 5). Delete server/src/{routes,controllers}/service.* once you've
// migrated any data you want to keep.

app.listen(process.env.PORT || 4000, () =>
  console.log(`Server on port ${process.env.PORT || 4000}`)
);
