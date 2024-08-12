const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const authRoutes = require('./authRoutes'); // Adjust the path as needed
const cors = require('cors');
const loginRoutes = require('./loginRoutes'); // New file for login
const nodemailer = require('nodemailer'); // Import nodemailer library
const bcrypt = require('bcrypt'); // Import bcrypt library
require('dotenv').config(); // Load environment variables

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from any origin for now. You can update this to be more restrictive later.
    callback(null, true);
  },
  credentials: true,
}));

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', loginRoutes); // Use the login routes
app.use('/api', authRoutes);

// Use session middleware (if you are using sessions for authentication)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Use environment variable or fallback
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit the application if the database connection fails
  }
  console.log('MySQL connected...');

  // Create users table if not exists
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(21) PRIMARY KEY, 
      companyName VARCHAR(255),
      email VARCHAR(255),
      password VARCHAR(255)
    )
  `;
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log('Users table checked/created...');
  });
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Register user endpoint
app.post('/register', async (req, res) => {
  const { companyName, email, password } = req.body;

  try {
    // Dynamically import nanoid with custom alphabet
    const { customAlphabet } = await import('nanoid');
    const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 6);
    const id = nanoid(); // Generate unique ID with custom alphabet

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = 'INSERT INTO users (id, companyName, email, password) VALUES (?, ?, ?, ?)';
    await new Promise((resolve, reject) => {
      db.query(sql, [id, companyName, email, hashedPassword], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    // Send registration email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      cc: ['support@pinakastra.cloud'],
      subject: 'Welcome to Pinakastra!',
      text: `Hello ${companyName},\n\nWelcome to our platform! Your account has been successfully registered.

Here are your registration details:

- Company Name:   ${companyName}
- UserID:                  ${id}

Please keep this information secure.

If you have any questions or need assistance, feel free to contact our support team.

Best regards,
The Pinakastra Team`
    };

    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          console.log('Email sent:', info.response);
          resolve(info);
        }
      });
    });

    res.status(200).json({ message: 'User registered successfully', userId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registering user' });
  }
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
