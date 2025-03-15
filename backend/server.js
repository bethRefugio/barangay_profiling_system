const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from this origin
    credentials: true // Allow credentials to be included
}));

app.use(bodyParser.json());

// Session middleware
app.use(session({
  secret: 'rXr@SS', // Change this to a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Connect to Redis
const client = redis.createClient({
  url: 'redis://@127.0.0.1:6379'  // Default Redis connection
});

client.connect()
  .then(() => console.log('✅ Connected to Redis'))
  .catch(err => console.error('❌ Redis connection error:', err));

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`📌 Incoming request: ${req.method} ${req.url}`);
  next();
});

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route to upload profile photo
app.post('/upload-profile-photo', upload.single('profilePhoto'), async (req, res) => {
  try {
      const userId = req.session.user?.userId;
      if (!userId) {
          return res.status(401).json({ message: 'User not authenticated' });
      }
      const profilePhotoPath = req.file.path;

      // Update user profile photo path in Redis
      await client.hSet(`user:${userId}`, 'profilePhoto', profilePhotoPath);

      res.status(200).json({ message: 'Profile photo uploaded successfully', profilePhoto: profilePhotoPath });
  } catch (error) {
      console.error('Error uploading profile photo:', error);
      res.status(500).json({ message: 'Failed to upload profile photo' });
  }
});

// CRUD Operations
// Route to save user data
app.post('/user', async (req, res) => {
  const { name, email, password, accountType } = req.body;

  // Validate input fields
  if (!name || !email || !password || !accountType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Hashing password
    const saltRounds = 5;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Increment the userId counter
    const userId = await client.incr('userIdCounter');

    // Set user data in Redis (using object syntax for Redis v4 and above)
    const userData = { 
      name, 
      email, 
      hashedPassword, 
      accountType, 
      status: 'Active', 
      profilePhoto: 'uploads/default-profile.png' // Default profile photo
    };

    // Save user data in Redis hash
    await client.hSet(`user:${userId}`, 'name', userData.name);
    await client.hSet(`user:${userId}`, 'email', userData.email);
    await client.hSet(`user:${userId}`, 'password', userData.hashedPassword);
    await client.hSet(`user:${userId}`, 'accountType', userData.accountType);
    await client.hSet(`user:${userId}`, 'status', userData.status);
    await client.hSet(`user:${userId}`, 'profilePhoto', userData.profilePhoto);

    // Respond with success message
    res.status(201).json({ message: 'User saved successfully', userId });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Failed to save user' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt with email:", email);

  // Validate input
  if (!email || !password) {
    console.error("Email or password not provided");
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Search for user in Redis (loop through stored users)
    const keys = await client.keys('user:*');
    console.log("User keys found in Redis:", keys);

    let userId = null;

    for (const key of keys) {
      const storedEmail = await client.hGet(key, 'email');
      if (storedEmail === email) {
        userId = key.split(':')[1];
        break;
      }
    }

    if (!userId) {
      console.error("User not found for email:", email);
      return res.status(404).json({ message: 'User not found' });
    }

    // Retrieve user details from Redis
    const storedPassword = await client.hGet(`user:${userId}`, 'password');
    console.log("Stored password retrieved for userId:", userId);

    const accountType = await client.hGet(`user:${userId}`, 'accountType');

    // Verify password
    const isMatch = await bcrypt.compare(password, storedPassword);
    if (!isMatch) {
      console.error("Invalid password for userId:", userId);
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Store user session
    req.session.user = { userId, email, accountType };
    res.status(200).json({ message: 'Login successful', userId, accountType });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Fetch specific user
app.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const user = await client.hGetAll(`user:${userId}`);
  if (Object.keys(user).length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});

// Add this route to fetch all users
app.get('/user', async (req, res) => {
  try {
    const keys = await client.keys('user:*');
    const users = await Promise.all(keys.map(async (key) => {
      return { id: key.split(':')[1], ...(await client.hGetAll(key)) };
    }));
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update (U)
app.put('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { name, email, password, profilePhoto } = req.body;
  
  if (!name && !email && !password && !profilePhoto) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
    const existingUser = await client.hGetAll(`user:${userId}`);
    if (Object.keys(existingUser).length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user data in Redis
    if (name) await client.hSet(`user:${userId}`, 'name', name);
    if (email) await client.hSet(`user:${userId}`, 'email', email);
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 5);
      await client.hSet(`user:${userId}`, 'password', hashedPassword);
    }
    if (profilePhoto) await client.hSet(`user:${userId}`, 'profilePhoto', profilePhoto);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete (D) user
app.delete('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  await client.hSet(`user:${userId}`, 'status', 'Inactive');
  res.status(200).json({ message: 'User status set to Inactive' });
});

// Route to save resident data
app.post('/resident', async (req, res) => {
  const { fullname, age, purok, gender, birthdate, email, phone, civil_status, is_pwd, is_senior, employment_status, income_source, educational_level } = req.body;

  // Validate input fields
  if (!fullname || !age || !purok || !gender || !birthdate || !email || !phone || !civil_status || !is_pwd || !is_senior || !employment_status || !income_source || !educational_level) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Increment the residentId counter
    const residentId = await client.incr('residentIdCounter');

    // Set student data in Redis (using object syntax for Redis v4 and above)
    const residentData = { fullname, age, purok, gender, birthdate, email, phone, civil_status, is_pwd, is_senior, employment_status, income_source, educational_level };

    // Save student data in Redis hash
    await client.hSet(`resident:${residentId}`, 'fullname', residentData.fullname);
    await client.hSet(`resident:${residentId}`, 'age', residentData.age);
    await client.hSet(`resident:${residentId}`, 'purok', residentData.purok);
    await client.hSet(`resident:${residentId}`, 'gender', residentData.gender);
    await client.hSet(`resident:${residentId}`, 'birthdate', residentData.birthdate);
    await client.hSet(`resident:${residentId}`, 'email', residentData.email);
    await client.hSet(`resident:${residentId}`, 'phone', residentData.phone);
    await client.hSet(`resident:${residentId}`, 'civil_status', residentData.civil_status);
    await client.hSet(`resident:${residentId}`, 'is_pwd', residentData.is_pwd);
    await client.hSet(`resident:${residentId}`, 'is_senior', residentData.is_senior);
    await client.hSet(`resident:${residentId}`, 'employment_status', residentData.employment_status); 
    await client.hSet(`resident:${residentId}`, 'income_source', residentData.income_source);
    await client.hSet(`resident:${residentId}`, 'educational_level', residentData.educational_level);

    // Respond with success message
    res.status(201).json({ message: 'Resident saved successfully', residentId });
  } catch (error) {
    console.error('Error saving resident:', error);
    res.status(500).json({ message: 'Failed to save resident' });
  }
});

// Read (R)
app.get('/resident/:residentId', async (req, res) => {
  const residentId = req.params.residentId;
  const resident = await client.hGetAll(`resident:${residentId}`);
  if (Object.keys(resident).length === 0) {
    return res.status(404).json({ message: 'Resident not found' });
  }
  res.json(resident);
});

// Read all students
app.get('/resident', async (req, res) => {
  const keys = await client.keys('resident:*');
  const residents = await Promise.all(keys.map(async (key) => {
    return { residentId: key.split(':')[1], ...(await client.hGetAll(key)) };
  }));
  res.json(residents);
});

// Update (U)
app.put('/resident/:residentId', async (req, res) => {
  const residentId = req.params.residentId;
  const { fullname, age, purok, gender, birthdate, email, phone, civil_status, is_pwd, is_senior, employment_status, income_source, educational_level } = req.body;

  if (!fullname && !age && !purok && !gender && !birthdate && !email && !phone && !civil_status && !is_pwd && !is_senior && !employment_status && !income_source && !educational_level) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
    const existingResident = await client.hGetAll(`resident:${residentId}`);
    if (Object.keys(existingResident).length === 0) {
      return res.status(404).json({ message: 'Resident not found' });
    }

    // Update student data in Redis
    if (fullname) await client.hSet(`resident:${residentId}`, 'fullname', fullname);
    if (age) await client.hSet(`resident:${residentId}`, 'age', age);
    if (purok) await client.hSet(`resident:${residentId}`, 'purok', purok);
    if (gender) await client.hSet(`resident:${residentId}`, 'gender', gender);
    if (birthdate) await client.hSet(`resident:${residentId}`, 'birthdate', birthdate);
    if (email) await client.hSet(`resident:${residentId}`, 'email', email);
    if (phone) await client.hSet(`resident:${residentId}`, 'phone', phone);
    if (civil_status) await client.hSet(`resident:${residentId}`, 'civil_status', civil_status);
    if (is_pwd) await client.hSet(`resident:${residentId}`, 'is_pwd', is_pwd);
    if (is_senior) await client.hSet(`resident:${residentId}`, 'is_senior', is_senior);
    if (employment_status) await client.hSet(`resident:${residentId}`, 'employment_status', employment_status);
    if (income_source) await client.hSet(`resident:${residentId}`, 'income_source', income_source);
    if (educational_level) await client.hSet(`resident:${residentId}`, 'educational_level', educational_level);
    

    res.status(200).json({ message: 'Resident updated successfully' });
  } catch (error) {
    console.error('Error updating resident:', error);
    res.status(500).json({ message: 'Failed to update resident' });
  }
});

// Delete (D)
app.delete('/resident/:residentId', async (req, res) => {
  const residentId = req.params.residentId;
  await client.del(`resident:${residentId}`);
  res.status(200).json({ message: 'resident deleted successfully' });
});

app._router.stack.forEach((middleware) => {
  if (middleware.route) { // If middleware has a route
      console.log(`✅ Registered Route: ${middleware.route.path}`);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});