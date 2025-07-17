const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');


const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const offerSchema = new mongoose.Schema({
  name: String,
  email: String,
  company: String,
  position: String,
  link: String,
  timestamp: { type: Date, default: Date.now }
});

const Offer = mongoose.model('Offer', offerSchema);


// Показываем папку public как сайт
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/submit-offer', async (req, res) => {
  try {
    const newOffer = new Offer(req.body);
    await newOffer.save();
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', error: err });
  }
});


const ADMIN_USERNAME = 'adminKelerbit';
const ADMIN_PASSWORD = '32445';



app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.cookie('isAdmin', 'true', { httpOnly: true });
    res.status(200).send('OK');
  } else {
    res.status(401).send('Unauthorized');
  }
});


app.get('/api/offers', async (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const offers = await Offer.find().sort({ timestamp: -1 });
  res.json(offers);
});


app.get('/logout', (req, res) => {
  res.clearCookie('isAdmin');
  res.redirect('/admin-login.html');
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});