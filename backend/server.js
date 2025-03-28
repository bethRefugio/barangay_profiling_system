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
//app.use((req, res, next) => {
  //console.log(`📌 Incoming request: ${req.method} ${req.url}`);
  //next();
//});

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
    const accountType = await client.hGet(`user:${userId}`, 'accountType');
    const status = await client.hGet(`user:${userId}`, 'status'); // Get user status

    console.log("Stored password retrieved for userId:", userId);
    console.log("Account type:", accountType);
    console.log("Account status:", status);

    // Check if the account is active
    if (status !== "Active") {
      console.error("Inactive or deleted account:", userId);
      return res.status(403).json({ message: "This account doesn't exist anymore" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, storedPassword);
    if (!isMatch) {
      console.error("Invalid password for userId:", userId);
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Return success response
    res.status(200).json({ message: 'Login successful', userId, accountType });

  } catch (error) {
    console.error("Error during login:", error);
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

app.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const user = await client.hGetAll(`user:${userId}`);
  if (Object.keys(user).length === 0) {
      return res.status(404).json({ message: 'User not found' });
  }
  // Decrypt the password before sending it to the frontend
  const decryptedPassword = await bcrypt.compare(user.password, user.password);
  user.password = decryptedPassword ? user.password : '';
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
app.put('/user/:userId', upload.single('profilePhoto'), async (req, res) => {
  const userId = req.params.userId;
  let { name, email, password, accountType, status } = req.body;
  let profilePhoto = req.file ? req.file.path : null; // Get uploaded file path

  if (!name && !email && !password && !accountType && !status && !profilePhoto) {
      return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
      const existingUser = await client.hGetAll(`user:${userId}`);
      if (Object.keys(existingUser).length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Update text fields
      if (name) await client.hSet(`user:${userId}`, 'name', name);
      if (email) await client.hSet(`user:${userId}`, 'email', email);
      if (password) {
          const hashedPassword = await bcrypt.hash(password, 5);
          await client.hSet(`user:${userId}`, 'password', hashedPassword);
      }
      if (accountType) await client.hSet(`user:${userId}`, 'accountType', accountType);
      if (status) await client.hSet(`user:${userId}`, 'status', status);

      // Update profile photo if a new one is uploaded
      if (profilePhoto) {
          await client.hSet(`user:${userId}`, 'profilePhoto', profilePhoto);
      }

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
  const { fullname, age, purok, gender, birthdate, email, phone, civil_status, is_pwd, is_aVoter, employment_status, income_source, educational_level } = req.body;

  // Validate input fields
  if (!fullname || !age || !purok || !gender || !birthdate || !email || !phone || !civil_status || !is_pwd || !is_aVoter || !employment_status || !income_source || !educational_level) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Increment the residentId counter
    const residentId = await client.incr('residentIdCounter');

    // Set student data in Redis (using object syntax for Redis v4 and above)
    const residentData = { fullname, age, purok, gender, birthdate, email, phone, civil_status, is_pwd, is_aVoter, employment_status, income_source, educational_level };

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
    await client.hSet(`resident:${residentId}`, 'is_aVoter', residentData.is_aVoter);
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
  const { fullname, age, purok, gender, birthdate, email, phone, civil_status, is_pwd, is_aVoter, employment_status, income_source, educational_level } = req.body;

  if (!fullname && !age && !purok && !gender && !birthdate && !email && !phone && !civil_status && !is_pwd && !is_aVoter && !employment_status && !income_source && !educational_level) {
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
    if (is_aVoter) await client.hSet(`resident:${residentId}`, 'is_aVoter', is_aVoter);
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

// Route to save official data
app.post('/official', async (req, res) => {
  const { fullname, position, phone, profilePhoto } = req.body;

  if (!fullname || !position || !phone) {
      return res.status(400).json({ message: 'Full name, position, and phone are required' });
  }

  try {
      const officialId = await client.incr('officialIdCounter');

      const officialData = {
        fullname,
        position,
        phone,
        profilePhoto: profilePhoto && profilePhoto.trim() !== "" ? profilePhoto : 'uploads/default-profile.png'
    };
    

      await client.hSet(`official:${officialId}`, 'fullname', officialData.fullname);
      await client.hSet(`official:${officialId}`, 'position', officialData.position);
      await client.hSet(`official:${officialId}`, 'phone', officialData.phone);
      await client.hSet(`official:${officialId}`, 'profilePhoto', officialData.profilePhoto);

      res.status(201).json({ message: 'Official saved successfully', officialId });
  } catch (error) {
      console.error('Error saving official:', error);
      res.status(500).json({ message: 'Failed to save official' });
  }
});

// Route to upload an official's profile photo
app.post('/upload-official-photo', upload.single('profilePhoto'), async (req, res) => {
  try {
      const { officialId } = req.body;
      if (!officialId) {
          return res.status(400).json({ message: 'Official ID is required' });
      }

      const profilePhotoPath = req.file.path;

      // Store the image path in Redis
      await client.hSet(`official:${officialId}`, 'profilePhoto', profilePhotoPath);

      res.status(200).json({ message: 'Photo uploaded successfully', profilePhoto: profilePhotoPath });
  } catch (error) {
      console.error('Error uploading profile photo:', error);
      res.status(500).json({ message: 'Failed to upload photo' });
  }
});

app.get('/official', async (req, res) => {
  try {
      const keys = await client.keys('official:*');
      const officials = await Promise.all(keys.map(async (key) => {
          const official = await client.hGetAll(key);

          // Ensure the official has all required fields
          if (!official.fullname || !official.position || !official.phone) {
              return null; // Ignore empty or incomplete entries
          }

          return { id: key.split(':')[1], ...official };
      }));

      // Remove null values from the list
      res.json(officials.filter(o => o !== null));
  } catch (error) {
      console.error('Error fetching officials:', error);
      res.status(500).json({ message: 'Failed to fetch officials' });
  }
});


// Fetch specific official
app.get('/official/:officialId', async (req, res) => {
  const officialId = req.params.officialId;
  const official = await client.hGetAll(`official:${officialId}`);
  if (Object.keys(official).length === 0) {
    return res.status(404).json({ message: 'Official not found' });
  }
  res.json(official);
});

// Update official
app.put('/official/:officialId', upload.single('profilePhoto'), async (req, res) => {
  const officialId = req.params.officialId;
  let { fullname, position, phone } = req.body;
  let profilePhoto = req.file ? req.file.path : null; // Get uploaded file path

  if (!fullname && !position && !phone && !profilePhoto) {
      return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
      const existingOfficial = await client.hGetAll(`official:${officialId}`);
      if (Object.keys(existingOfficial).length === 0) {
          return res.status(404).json({ message: 'Official not found' });
      }

      // Update text fields
      if (fullname) await client.hSet(`official:${officialId}`, 'fullname', String(fullname));
      if (position) await client.hSet(`official:${officialId}`, 'position', String(position));
      if (phone) await client.hSet(`official:${officialId}`, 'phone', String(phone));

      // Update profile photo if a new one is uploaded
      if (profilePhoto) {
          await client.hSet(`official:${officialId}`, 'profilePhoto', profilePhoto);
      }

      res.status(200).json({ message: 'Official updated successfully' });
  } catch (error) {
      console.error('Error updating official:', error);
      res.status(500).json({ message: 'Failed to update official' });
  }
});




// Delete official
app.delete('/official/:officialId', async (req, res) => {
  const officialId = req.params.officialId;
  await client.del(`official:${officialId}`);
  res.status(200).json({ message: 'Official deleted successfully' });
});


// Route to save request data
app.post('/request', async (req, res) => {
  const { name, age, address, documentType, purpose, userId } = req.body;
  console.log("Incoming request data:", req.body);

  if (!name || !age || !address || !documentType || !purpose || !userId) {
      return res.status(400).json({ message: 'All fields are required' });
  }

  try {
      const requestId = await client.incr('requestIdCounter');
      const dateOfRequest = new Date().toISOString(); // Automatically set the current date and time
      const status = "Pending"; // Default status

      const requestData = { name, age, address, documentType, purpose, dateOfRequest, status, userId };

      await client.hSet(`request:${requestId}`, 'name', requestData.name);
      await client.hSet(`request:${requestId}`, 'age', requestData.age);
      await client.hSet(`request:${requestId}`, 'address', requestData.address);
      await client.hSet(`request:${requestId}`, 'documentType', requestData.documentType);
      await client.hSet(`request:${requestId}`, 'purpose', requestData.purpose);
      await client.hSet(`request:${requestId}`, 'dateOfRequest', requestData.dateOfRequest);  
      await client.hSet(`request:${requestId}`, 'status', requestData.status);
      await client.hSet(`request:${requestId}`, 'userId', requestData.userId);

      res.status(201).json({ message: 'Request saved successfully', requestId });
  } catch (error) {
      console.error('Error saving request:', error);
      res.status(500).json({ message: 'Failed to save request' });
  }
});

// Route to fetch requests for a specific user
app.get('/request/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
      const keys = await client.keys('request:*');
      const requests = await Promise.all(
          keys.map(async (key) => {
              const request = await client.hGetAll(key);
              if (request.userId === userId) {
                  return { id: key.split(':')[1], ...request };
              }
              return null;
          })
      );

      res.json(requests.filter((request) => request !== null));
  } catch (error) {
      console.error('Error fetching user requests:', error);
      res.status(500).json({ message: 'Failed to fetch user requests' });
  }
});

// Route to fetch all requests
app.get('/request', async (req, res) => {
  try {
      const keys = await client.keys('request:*');
      const requests = await Promise.all(
          keys.map(async (key) => {
              const request = await client.hGetAll(key);
              return { id: key.split(':')[1], ...request };
          })
      );
      res.json(requests);
  } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ message: 'Failed to fetch requests' });
  }
});

// Update request
app.put('/request/:requestId', async (req, res) => {
  const requestId = req.params.requestId;
  const { name, address, documentType, purpose, status } = req.body;

  try {
      const existingRequest = await client.hGetAll(`request:${requestId}`);
      if (!existingRequest) {
          return res.status(404).json({ message: "Request not found" });
      }

      if (name) await client.hSet(`request:${requestId}`, "name", name);
      if (address) await client.hSet(`request:${requestId}`, "address", address);
      if (documentType) await client.hSet(`request:${requestId}`, "documentType", documentType);
      if (purpose) await client.hSet(`request:${requestId}`, "purpose", purpose);
      if (status) await client.hSet(`request:${requestId}`, "status", status);

      res.status(200).json({ message: "Request updated successfully" });
  } catch (error) {
      console.error("Error updating request:", error);
      res.status(500).json({ message: "Failed to update request" });
  }
});

// Route to generate the next O.R. number
app.get('/generate-or-number', async (req, res) => {
  try {
      const currentYear = new Date().getFullYear(); // Get the current year
      const key = `orNumber:${currentYear}`; // Redis key for the current year's O.R. numbers

      // Increment the counter for the current year
      const counter = await client.incr(key);

      // Format the O.R. number as "2025-B-00001"
      const orNumber = `${currentYear}-B-${String(counter).padStart(5, '1')}`;

      res.status(200).json({ orNumber });
  } catch (error) {
      console.error('Error generating O.R. number:', error);
      res.status(500).json({ message: 'Failed to generate O.R. number' });
  }
});

app.post('/announcements', async (req, res) => {
  const { title, content, time, date, place } = req.body;

  if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
      // Auto-increment the announcementId
      const announcementId = await client.incr('announcementIdCounter');
      const announcementData = { title, content, time, date, place };

      // Save the announcement data in Redis
      await client.hSet(`announcement:${announcementId}`, 'title', announcementData.title);
      await client.hSet(`announcement:${announcementId}`, 'content', announcementData.content);
      await client.hSet(`announcement:${announcementId}`, 'time', announcementData.time);
      await client.hSet(`announcement:${announcementId}`, 'date', announcementData.date);
      await client.hSet(`announcement:${announcementId}`, 'place', announcementData.place);

      res.status(201).json({ id: announcementId, ...announcementData });
  } catch (error) {
      console.error('Error saving announcement:', error);
      res.status(500).json({ message: 'Failed to save announcement' });
  }
});

// Fetch all announcements
app.get('/announcements', async (req, res) => {
  try {
      const keys = await client.keys('announcement:*');
      const announcements = await Promise.all(
          keys.map(async (key) => {
              const announcement = await client.hGetAll(key);
              return { id: key.split(':')[1], ...announcement };
          })
      );
      res.json(announcements);
  } catch (error) {
      console.error('Error fetching announcements:', error);
      res.status(500).json({ message: 'Failed to fetch announcements' });
  }
});

// Update announcement
app.put('/announcements/:id', async (req, res) => {
  const id = req.params.id;
  const { title, content, time, date, place } = req.body;

  try {
      const existingAnnouncement = await client.hGetAll(`announcement:${id}`);
      if (!existingAnnouncement) {
          return res.status(404).json({ message: 'Announcement not found' });
      }

      if (title) await client.hSet(`announcement:${id}`, 'title', title);
      if (content) await client.hSet(`announcement:${id}`, 'content', content);
      if (time) await client.hSet(`announcement:${id}`, 'time', time);
      if (date) await client.hSet(`announcement:${id}`, 'date', date);
      if (place) await client.hSet(`announcement:${id}`, 'place', place);

      const updatedAnnouncement = await client.hGetAll(`announcement:${id}`);
      res.status(200).json({ id, ...updatedAnnouncement });
  } catch (error) {
      console.error('Error updating announcement:', error);
      res.status(500).json({ message: 'Failed to update announcement' });
  }
});

// Delete announcement
app.delete('/announcements/:id', async (req, res) => {
  const id = req.params.id;
  try {
      await client.del(`announcement:${id}`);
      res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (error) {
      console.error('Error deleting announcement:', error);
      res.status(500).json({ message: 'Failed to delete announcement' });
  }
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