const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const axios = require('axios');


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



/**
 * @swagger
 * /:
 *   get:
 *     summary: Get main CV page
 *     tags: [Frontend]
 *     responses:
 *       200:
 *         description: Returns main HTML resume page
 */


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


/**
 * @swagger
 * /submit-offer:
 *   post:
 *     summary: Submit job offer form
 *     tags: [Offers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               company:
 *                 type: string
 *               position:
 *                 type: string
 *               link:
 *                 type: string
 *     responses:
 *       200:
 *         description: Offer successfully submitted
 */



app.post('/submit-offer', async (req, res) => {
  try {
    const newOffer = new Offer(req.body);
    await newOffer.save();

    // Отправляем email через Resend
    await axios.post('https://api.resend.com/emails', {
      from: 'Kelerbit Form <onboarding@resend.dev>',
      to: 'kelerbit@gmail.com',
      subject: `📩 New Offer from ${req.body.name}`,
      html: `
        <h3>New Job Offer Submitted</h3>
        <ul>
          <li><strong>Name:</strong> ${req.body.name}</li>
          <li><strong>Email:</strong> ${req.body.email}</li>
          <li><strong>Company:</strong> ${req.body.company}</li>
          <li><strong>Position:</strong> ${req.body.position}</li>
          <li><strong>Link:</strong> <a href="${req.body.link}">${req.body.link}</a></li>
        </ul>
      `
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({ status: 'ok' });

  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ status: 'error', error: err });
  }
});




const ADMIN_USERNAME = 'adminKelerbit';
const ADMIN_PASSWORD = '32445';


/**
 * @swagger
 * /admin-login:
 *   post:
 *     summary: Log in as admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Invalid credentials
 */


app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.cookie('isAdmin', 'true', { httpOnly: true });
    res.status(200).send('OK');
  } else {
    res.status(401).send('Unauthorized');
  }
});


/**
 * @swagger
 * /api/offers:
 *   get:
 *     summary: Get all submitted job offers (admin only)
 *     tags: [Offers]
 *     responses:
 *       200:
 *         description: List of offers
 *       401:
 *         description: Unauthorized
 */


app.get('/api/offers', async (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const offers = await Offer.find().sort({ timestamp: -1 });
  res.json(offers);
});



/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Logout admin and clear session
 *     tags: [Admin]
 *     responses:
 *       302:
 *         description: Clears cookie and redirects to login page
 */


app.get('/logout', (req, res) => {
  res.clearCookie('isAdmin');
  res.redirect('/admin-login.html');
});


/**
 * @swagger
 * /api/offers/{id}:
 *   delete:
 *     summary: Delete a job offer by ID (admin only)
 *     tags: [Offers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the offer
 *     responses:
 *       200:
 *         description: Offer deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


app.delete('/api/offers/:id', async (req, res) => {
  if (req.cookies.isAdmin !== 'true') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});



app.get('/api/remote-jobs', async (req, res) => {
  try {
    const response = await axios.get('https://remoteok.io/api', {
      headers: { 'Accept-Encoding': 'application/json' }
    });

    const data = response.data;
    const keywords = ["project", "project manager", "pm", "program", "program manager", "delivery", "delivery manager", "scrum", "scrum master", "agile", "agile coach", "product manager", "product owner", "technical manager", "tech manager", "team lead", "it manager", "engineering manager", "operations manager", "implementation manager", "implementation lead", "business analyst", "ba", "coordinator", "technical coordinator", "producer", "executive producer", "release manager", "project coordinator", "portfolio manager", "transformation manager", "customer success manager", "cs manager", "process manager", "workflow manager", "kanban", "lead", "project lead", "strategy manager", "digital manager", "client delivery", "program lead", "director of operations", "engagement manager", "product operations", "service delivery", "it project", "software project", "implementation specialist", "team coordinator", "remote project", "remote manager", "workflow lead"];

    const jobs = data.slice(1).filter(job => {
      const title = (job.position || '').toLowerCase();
      return keywords.some(keyword => title.includes(keyword));
    });

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching remote jobs:', error.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});



const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kelerbit CV API',
      version: '1.0.0',
      description: 'API for contact form, admin panel, and offers'
    },
    servers: [
      {
        url: 'https://kelerbit.com', // или http://localhost:3000 при локальной разработке
      }
    ]
  },
  apis: ['./index.js'], // где искать описания
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});