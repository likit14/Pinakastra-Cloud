const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const authRoutes = require('./authRoutes'); // Adjust the path as needed
const cors = require('cors');
const loginRoutes = require('./loginRoutes'); // New file for login
const nodemailer = require('nodemailer'); // Import nodemailer library

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api', loginRoutes); // Use the login routes
app.use('/api', authRoutes);

// Use session middleware (if you are using sessions for authentication)
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));
    // Other middleware like bodyParser, cors, etc.
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Use the authRoutes and loginRoutes


// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Change this to your MySQL username
  password: 'Likith@172323', // Change this to your MySQL password
  database: 'standalone', // Change this to your MySQL database name
});

db.connect(err => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected...');
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pinakastra.join@gmail.com', // Your email address
    pass: 'sqei dbiv vxou ddsy' // Your email password
  }
});

// Create users table endpoint
app.get('/createuserstable', (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY,
      companyName VARCHAR(255),
      email VARCHAR(255),
      password VARCHAR(255)
    )
  `;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send('Users table created...');
  });
});

// Register user endpoint
app.post('/register', (req, res) => {
  const { companyName, email, password } = req.body;
  const id = uuidv4(); // Generate UUID

  const sql = 'INSERT INTO users (id, companyName, email, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [id, companyName, email, password], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error registering user' });
    }



    // Send registration email
    const mailOptions = {
      from: 'pinakastra.join@gmail.com',
      to: email,
      cc: ['support@pinakastra.cloud'],
      subject: 'Welcome to Pinakastra!',
      text: `Hello ${companyName},\n\nWelcome to our platform! Your account has been successfully registered.
    

Here are your registration details:

- Company Name:  ${companyName}
- User ID:                ${id}

We look forward to support your success!

Best regards,
The Pinakastra Cloud Team

---

Pinakastra Cloud
Email: support@pinakastra.cloud
Website: https://pinakastra.com/`};

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.error('Email sending error:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(200).json({ message: 'User registered successfully', userId: id });
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});