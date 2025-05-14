const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from this origin
    credentials: true // Allow credentials to be included
}));
app.use(bodyParser.json());

const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/barangay_system',
  collectionName: 'sessions'
});

// Session middleware
app.use(session({
  secret: 'rXr@SS', // Change this to a strong secret
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/barangay_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('✅ Connected to MongoDB');
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

// Define Mongoose Schemas and Models
const UserSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    email: String,
    password: String,
    accountType: String,
    status: { type: String, default: 'Active' },
    profilePhoto: { type: String, default: 'uploads/default-profile.png' },
    linkedId: { type: Number, required: true }// This will store the residentId or officialId
});

const ResidentSchema = new mongoose.Schema({
    _id: Number,
    fullname: String,
    age: Number,
    purok: String,
    gender: String,
    birthdate: String,
    email: String,
    phone: String,
    religion: String,
    civil_status: String,
    is_pwd: String,
    is_aVoter: String,
    employment_status: String,
    income_source: String,
    educational_level: String,
    qrCode: String
});

const OfficialSchema = new mongoose.Schema({
    _id: Number,
    fullname: String,
    position: String,
    phone: String,
    email: String,
    profilePhoto: { type: String, default: 'uploads/default-profile.png' },
    qrCode: String
});

const RequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
    documentType: { type: String, required: true },
    purpose: { type: String, required: true },
    dateOfRequest: { type: Date, default: Date.now },
    status: { type: String, default: "Pending" },
    userId: { type: Number, required: true }
});

const AnnouncementSchema = new mongoose.Schema({
    title: String,
    content: String,
    time: String,
    date: String,
    place: String
});

const EventSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    date: String,
    time: String,
    location: String,
    status: String
});

const ORCounterSchema = new mongoose.Schema({
    year: Number,
    counter: { type: Number, default: 0 }
});

const CounterSchema = new mongoose.Schema({
    entity: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 }
});

const ResidentAttendanceSchema = new mongoose.Schema({
    residentId: Number,
    name: String,
    age: Number,
    gender: String,
    purok: String,
    eventId: Number,
    time: Date,
});

const OfficialAttendanceSchema = new mongoose.Schema({
    officialId: Number,
    fullname: String,
    position: String,
    phone: String,
    eventId: Number,
    time: Date,
});

const Counter = mongoose.model('Counter', CounterSchema);
const User = mongoose.model('User', UserSchema);
const Resident = mongoose.model('Resident', ResidentSchema);
const Official = mongoose.model('Official', OfficialSchema);
const Request = mongoose.model('Request', RequestSchema);
module.exports = Request; // Export the Request model for use in other files
const Announcement = mongoose.model('Announcement', AnnouncementSchema);
const Event = mongoose.model('Event', EventSchema);
const ORCounter = mongoose.model('ORCounter', ORCounterSchema);
const ResidentAttendance = mongoose.model('ResidentAttendance', ResidentAttendanceSchema);
const OfficialAttendance = mongoose.model('OfficialAttendance', OfficialAttendanceSchema);


const getNextSequence = async (entity) => {
    const counter = await Counter.findOneAndUpdate(
        { entity },
        { $inc: { count: 1 } },
        { new: true, upsert: true } // Create the counter if it doesn't exist
    );
    return counter.count;
};

// Route to upload profile photo
app.post('/upload-profile-photo', upload.single('profilePhoto'), async (req, res) => {
    try {
        const userId = req.session.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const profilePhotoPath = req.file.path;

        // Update user profile photo path in MongoDB
        await User.findByIdAndUpdate(userId, { profilePhoto: profilePhotoPath });

        res.status(200).json({ message: 'Profile photo uploaded successfully', profilePhoto: profilePhotoPath });
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        res.status(500).json({ message: 'Failed to upload profile photo' });
    }
});

// CRUD Operations for Users
app.post('/user', async (req, res) => {
    const { name, email, password, accountType } = req.body;

    if (!name || !email || !password || !accountType) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        let linkedId = null;

        if (accountType === 'Resident') {
            // Check if the user exists in the Resident collection
            const resident = await Resident.findOne({ fullname: name });
            if (!resident) {
                return res.status(400).json({ message: 'No matching resident found for the provided name.' });
            }

            // If the email does not match, update it
            if (resident.email !== email) {
                resident.email = email;
                await resident.save();
            }

            linkedId = resident._id; // Save the residentId
            console.log('Resident linkedId: ', linkedId); // Debugging log
        } else if (accountType === 'Staff') {
            // Check if the user exists in the Official collection
            const official = await Official.findOne({ fullname: name });
            if (!official) {
                return res.status(400).json({ message: 'No matching staff found for the provided name.' });
            }

            // If the email does not match, update it
            if (official.email !== email) {
                official.email = email;
                await official.save();
            }

            linkedId = official._id; // Save the officialId
            console.log('Official linkedId: ', linkedId); // Debugging log
        }

        if (!linkedId) {
            return res.status(400).json({message: 'Failed to link the user to a resident or staff'})
        }

        const userId = await getNextSequence('userId'); // Get the next userId
        const hashedPassword = await bcrypt.hash(password, 5);

        const user = new User({
            _id: userId, // Use the auto-incremented ID
            name,
            email,
            password: hashedPassword,
            accountType,
            status: 'Active',
            profilePhoto: 'uploads/default-profile.png',
            linkedId  // Save the residentId or officialId
        });

        await user.save();
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
        // Find user with provided email
        const user = await User.findOne({ email });

        if (!user) {
            console.error("User not found for email:", email);
            return res.status(404).json({ message: 'User not found' });
        }

        // Check account status
        if (user.status !== "Active") {
            console.error(`Account inactive or deleted for userId: ${user._id}`);
            return res.status(403).json({ message: "This account doesn't exist anymore" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error(`Invalid password for userId: ${user._id}`);
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Set user in session
        req.session.user = {
            userId: user._id,
            accountType: user.accountType,
            name: user.name,
            email: user.email
        };

        console.log(`User logged in successfully: ${user._id}`);

        // Return success response
        res.status(200).json({
            message: 'Login successful',
            userId: user._id,
            accountType: user.accountType,
            name: user.name,
            email: user.email
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetch specific user
app.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;

    if (!userId || userId === 'undefined') {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            accountType: user.accountType,
            status: user.status,
            profilePhoto: user.profilePhoto,
            linkedId: user.linkedId 
        };

        res.json(userResponse);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
});

// Fetch all users
app.get('/user', async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }); // Exclude password field
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Update user
app.put('/user/:userId', upload.single('profilePhoto'), async (req, res) => {
    const userId = req.params.userId;
    let { name, email, password, accountType, status } = req.body;
    let profilePhoto = req.file ? req.file.path : undefined; // Get uploaded file path

    try {
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create update object
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 5);
            updateData.password = hashedPassword;
        }
        if (accountType) updateData.accountType = accountType;
        if (status) updateData.status = status;
        if (profilePhoto) updateData.profilePhoto = profilePhoto;

        // Update user in database
        await User.findByIdAndUpdate(userId, updateData);

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

// Delete (soft delete) user
app.delete('/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        await User.findByIdAndUpdate(userId, { status: 'Inactive' });
        res.status(200).json({ message: 'User status set to Inactive' });
    } catch (error) {
        console.error('Error setting user inactive:', error);
        res.status(500).json({ message: 'Failed to update user status' });
    }
});

// CRUD Operations for Residents
app.post('/resident', async (req, res) => {
    const { fullname, age, purok, gender, birthdate, email, phone, religion, civil_status, is_pwd, is_aVoter, employment_status, income_source, educational_level } = req.body;

    if (!fullname || !age || !purok || !gender || !birthdate || !email || !phone || !religion || !civil_status || is_pwd === undefined || is_aVoter === undefined || !employment_status || !income_source || !educational_level) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const residentId = await getNextSequence('residentId'); // Get the next residentId
        const qrCodeData = `Resident ID: ${residentId}`;
        const qrCode = await QRCode.toDataURL(qrCodeData);

        const resident = new Resident({
            _id: residentId, // Use the auto-incremented ID
            fullname,
            age,
            purok,
            gender,
            birthdate,
            email,
            phone,
            religion,
            civil_status,
            is_pwd,
            is_aVoter,
            employment_status,
            income_source,
            educational_level,
            qrCode
        });

        await resident.save();
        res.status(201).json({ message: 'Resident saved successfully', residentId });
    } catch (error) {
        console.error('Error saving resident:', error);
        res.status(500).json({ message: 'Failed to save resident' });
    }
});

// Fetch specific resident
app.get('/resident/:residentId', async (req, res) => {
    try {
        const resident = await Resident.findById(req.params.residentId);
        if (!resident) {
            return res.status(404).json({ message: 'Resident not found' });
        }
        res.json(resident);
    } catch (error) {
        console.error('Error fetching resident:', error);
        res.status(500).json({ message: 'Failed to fetch resident' });
    }
});

// Fetch all residents
app.get('/resident', async (req, res) => {
    try {
        const residents = await Resident.find();
        res.json(residents);
    } catch (error) {
        console.error('Error fetching residents:', error);
        res.status(500).json({ message: 'Failed to fetch residents' });
    }
});

// Fetch all residents with only _id and fullname for testing
app.get('/resident/all', async (req, res) => {
    try {
        const residents = await Resident.find({}, { _id: 1, fullname: 1 });
        res.json(residents);
    } catch (error) {
        console.error('Error fetching residents list:', error);
        res.status(500).json({ message: 'Failed to fetch residents list' });
    }
});

// Update resident
app.put('/resident/:residentId', async (req, res) => {
    const residentId = req.params.residentId;
    const { fullname, age, purok, gender, birthdate, email, phone, religion, civil_status, is_pwd, is_aVoter, employment_status, income_source, educational_level } = req.body;

    try {
        const existingResident = await Resident.findById(residentId);
        if (!existingResident) {
            return res.status(404).json({ message: 'Resident not found' });
        }

        // Create update object
        const updateData = {};
        if (fullname) updateData.fullname = fullname;
        if (age) updateData.age = age;
        if (purok) updateData.purok = purok;
        if (gender) updateData.gender = gender;
        if (birthdate) updateData.birthdate = birthdate;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (religion) updateData.religion = religion;
        if (civil_status) updateData.civil_status = civil_status;
        if (is_pwd !== undefined) updateData.is_pwd = is_pwd;
        if (is_aVoter !== undefined) updateData.is_aVoter = is_aVoter;
        if (employment_status) updateData.employment_status = employment_status;
        if (income_source) updateData.income_source = income_source;
        if (educational_level) updateData.educational_level = educational_level;

        await Resident.findByIdAndUpdate(residentId, updateData);
        res.status(200).json({ message: 'Resident updated successfully' });
    } catch (error) {
        console.error('Error updating resident:', error);
        res.status(500).json({ message: 'Failed to update resident' });
    }
});

// Delete resident
app.delete('/resident/:residentId', async (req, res) => {
    try {
        const resident = await Resident.findByIdAndDelete(req.params.residentId);
        if (!resident) {
            return res.status(404).json({ message: 'Resident not found' });
        }
        res.status(200).json({ message: 'Resident deleted successfully' });
    } catch (error) {
        console.error('Error deleting resident:', error);
        res.status(500).json({ message: 'Failed to delete resident' });
    }
});

// CRUD Operations for Officials
app.post('/official', async (req, res) => {
    const { fullname, position, phone, email, profilePhoto } = req.body;

    if (!fullname || !position || !phone || !email) {
        return res.status(400).json({ message: 'Full name, position, phone and email are required' });
    }

    try {
        const officialId = await getNextSequence('OfficialId'); // Get the next residentId
        const qrCodeData = `Official ID: ${officialId}`;
        const qrCode = await QRCode.toDataURL(qrCodeData);

        const official = new Official({
            _id: officialId, 
            fullname,
            position,
            phone,
            email,
            profilePhoto: profilePhoto && profilePhoto.trim() !== "" ? profilePhoto : 'uploads/default-profile.png',
            qrCode
        });

        await official.save();
        res.status(201).json({ message: 'Official saved successfully', officialId: official._id });
    } catch (error) {
        console.error('Error saving official:', error);
        res.status(500).json({ message: 'Failed to save official' });
    }
});

// Upload official's profile photo
app.post('/upload-official-photo', upload.single('profilePhoto'), async (req, res) => {
    try {
        const { officialId } = req.body;
        if (!officialId) {
            return res.status(400).json({ message: 'Official ID is required' });
        }

        const profilePhotoPath = req.file.path;

        // Update official's profile photo
        await Official.findByIdAndUpdate(officialId, { profilePhoto: profilePhotoPath });

        res.status(200).json({ message: 'Photo uploaded successfully', profilePhoto: profilePhotoPath });
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        res.status(500).json({ message: 'Failed to upload photo' });
    }
});

// Fetch all officials
app.get('/official', async (req, res) => {
    try {
        const officials = await Official.find();
        res.json(officials);
    } catch (error) {
        console.error('Error fetching officials:', error);
        res.status(500).json({ message: 'Failed to fetch officials' });
    }
});

// Fetch specific official
app.get('/official/:officialId', async (req, res) => {
    try {
        const official = await Official.findById(req.params.officialId);
        if (!official) {
            return res.status(404).json({ message: 'Official not found' });
        }
        res.json(official);
    } catch (error) {
        console.error('Error fetching official:', error);
        res.status(500).json({ message: 'Failed to fetch official' });
    }
});

// Update official
app.put('/official/:officialId', upload.single('profilePhoto'), async (req, res) => {
    const officialId = req.params.officialId;
    let { fullname, position, phone, email } = req.body;
    let profilePhoto = req.file ? req.file.path : undefined;

    try {
        const existingOfficial = await Official.findById(officialId);
        if (!existingOfficial) {
            return res.status(404).json({ message: 'Official not found' });
        }

        // Create update object
        const updateData = {};
        if (fullname) updateData.fullname = String(fullname);
        if (position) updateData.position = String(position);
        if (phone) updateData.phone = String(phone);
        if (email) updateData.email = String(email);
        if (profilePhoto) updateData.profilePhoto = profilePhoto;

        await Official.findByIdAndUpdate(officialId, updateData);
        res.status(200).json({ message: 'Official updated successfully' });
    } catch (error) {
        console.error('Error updating official:', error);
        res.status(500).json({ message: 'Failed to update official' });
    }
});

// Delete official
app.delete('/official/:officialId', async (req, res) => {
    try {
        const official = await Official.findByIdAndDelete(req.params.officialId);
        if (!official) {
            return res.status(404).json({ message: 'Official not found' });
        }
        res.status(200).json({ message: 'Official deleted successfully' });
    } catch (error) {
        console.error('Error deleting official:', error);
        res.status(500).json({ message: 'Failed to delete official' });
    }
});

// CRUD Operations for Requests
app.post('/request', async (req, res) => {
    const { name, age, address, documentType, purpose, userId } = req.body;
    console.log("Incoming request data:", req.body); //Debugging log

    if (!name || !age || !address || !documentType || !purpose || !userId) {
        console.error("Validation failed: Missing required fields");
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const request = new Request({
            name,
            age,
            address,
            documentType,
            purpose,
            dateOfRequest: new Date(),
            status: "Pending",
            userId
        });

        await request.save();
        console.log("Request saved successfully:", request); // Debugging log
        res.status(201).json({ message: 'Request saved successfully', requestId: request._id });
    } catch (error) {
        console.error('Error saving request:', error);
        res.status(500).json({ message: 'Failed to save request' });
    }
});

// Route to fetch requests for a specific user
app.get('/request/user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const requests = await Request.find({ userId });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching user requests:', error);
        res.status(500).json({ message: 'Failed to fetch user requests' });
    }
});

// Route to fetch all requests
app.get('/request', async (req, res) => {
    try {
        const requests = await Request.find();
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
        const existingRequest = await Request.findById(requestId);
        if (!existingRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Create update object
        const updateData = {};
        if (name) updateData.name = name;
        if (address) updateData.address = address;
        if (documentType) updateData.documentType = documentType;
        if (purpose) updateData.purpose = purpose;
        if (status) updateData.status = status;

        await Request.findByIdAndUpdate(requestId, updateData);
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
        
        // Find or create counter for current year
        let orCounter = await ORCounter.findOne({ year: currentYear });
        
        if (!orCounter) {
            orCounter = new ORCounter({ year: currentYear, counter: 0 });
        }
        
        // Increment counter
        orCounter.counter += 1;
        await orCounter.save();

        // Format the O.R. number as "2025-B-00001"
        const orNumber = `${currentYear}-B-${String(orCounter.counter).padStart(5, '1')}`;

        res.status(200).json({ orNumber });
    } catch (error) {
        console.error('Error generating O.R. number:', error);
        res.status(500).json({ message: 'Failed to generate O.R. number' });
    }
});

// CRUD Operations for Announcements
app.post('/announcements', async (req, res) => {
    const { title, content, time, date, place } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required' });
    }

    try {
        const announcement = new Announcement({
            title,
            content,
            time,
            date,
            place
        });

        await announcement.save();
        res.status(201).json({ id: announcement._id, title, content, time, date, place });
    } catch (error) {
        console.error('Error saving announcement:', error);
        res.status(500).json({ message: 'Failed to save announcement' });
    }
});

// Fetch all announcements
app.get('/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find();
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
        const existingAnnouncement = await Announcement.findById(id);
        if (!existingAnnouncement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Create update object
        const updateData = {};
        if (title) updateData.title = title;
        if (content) updateData.content = content;
        if (time) updateData.time = time;
        if (date) updateData.date = date;
        if (place) updateData.place = place;

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json(updatedAnnouncement);
    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({ message: 'Failed to update announcement' });
    }
});

// Delete announcement
app.delete('/announcements/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const announcement = await Announcement.findByIdAndDelete(id);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }
        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).json({ message: 'Failed to delete announcement' });
    }
});

// CRUD Operations for Events
app.post('/events', async (req, res) => {
    const { name, date, time, location, status } = req.body;

    // Validate input fields
    if (!name || !date || !time || !location || !status) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const eventId = await getNextSequence('eventId');

        const event = new Event({
            _id: eventId, // Use the auto-incremented ID
            name,
            date,
            time,
            location,
            status
        });

        await event.save();
        res.status(201).json({ message: 'Event saved successfully', eventId});
    } catch (error) {
        console.error('Error saving event:', error);
        res.status(500).json({ message: 'Failed to save event' });
    }
});

// Fetch specific event
app.get('/events/:eventId', async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Failed to fetch event' });
    }
});

// Fetch all events
app.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Failed to fetch events' });
    }
});

// Update event
app.put('/events/:eventId', async (req, res) => {
    const eventId = req.params.eventId;
    const { name, date, time, location, status } = req.body;

    try {
        const existingEvent = await Event.findById(eventId);
        if (!existingEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Create update object
        const updateData = {};
        if (name) updateData.name = name;
        if (date) updateData.date = date;
        if (time) updateData.time = time;
        if (location) updateData.location = location;
        if (status) updateData.status = status;

        await Event.findByIdAndUpdate(eventId, updateData);
        res.status(200).json({ message: 'Event updated successfully' });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ message: 'Failed to update event' });
    }
});

// Delete event
app.delete('/events/:eventId', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Failed to delete event' });
    }
});

const fetchResidentDetails = async (residentId) => {
    try {
        const resident = await Resident.findById(residentId);
        if (!resident) {
            throw new Error('Resident not found');
        }
        return resident;
    } catch (error) {
        console.error('Error fetching resident details:', error);
        throw error;
    }
}

const saveResidentAttendanceDetails = async (resident, eventId) => {
    try {
        const currentTime = new Date();

        // Calculate the time 5 seconds ago from currentTime
        const fiveSecondsAgo = new Date(currentTime.getTime() - 5000);

        // Check if an attendance record already exists with the same residentId, eventId, and time within last 5 seconds
        const existingAttendance = await ResidentAttendance.findOne({
            residentId: resident._id,
            eventId: eventId,
            time: { $gte: fiveSecondsAgo }
        });

        if (existingAttendance) {
            console.log('Attendance already recorded for this resident and event within 5 seconds');
        }

        // Create the attendance record
        const attendance = {
            residentId: resident._id,
            name: resident.fullname,
            age: resident.age,
            gender: resident.gender,
            purok: resident.purok,
            eventId: eventId,
            time: currentTime, // Use current time with milliseconds
        };

        await ResidentAttendance.create(attendance);
        return attendance;
    } catch (error) {
        console.error('Error saving attendance details:', error);
        throw error;
    }
};

// Endpoint to handle attendance recording
app.post('/attendance_residents', async (req, res) => {
    const { residentId, eventId } = req.body;

    if (!residentId || !eventId) { // Check if either residentId or eventId is missing
        return res.status(400).json({ message: 'Resident ID and Event ID are required' });
    }

    try {
        // Fetch resident details
        const resident = await fetchResidentDetails(residentId);

        // Save attendance details
        const attendance = await saveResidentAttendanceDetails(resident, eventId);

        // Respond with the attendance details
        res.status(201).json({ message: 'Attendance recorded successfully', attendance });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to fetch attendance for a specific event
app.get('/residents_attendance', async (req, res) => {
    try {
        const residentsAttendance = await ResidentAttendance.find(); // Fetch all attendance records
        res.status(200).json(residentsAttendance);
    } catch (error) {
        console.error('Error fetching residents attendance:', error);
        res.status(500).json({ message: 'Failed to fetch residents attendance' });
    }
});

// Fetch specific record
app.get('/residents_attendance/:_id', async (req, res) => {
    try {
        const ResidentAttendance = await ResidentAttendance.findById(req.params._id);
        if (!ResidentAttendance) {
            return res.status(404).json({ message: 'Record not found' });
        }
        res.json(ResidentAttendance);
    } catch (error) {
        console.error('Error fetching record:', error);
        res.status(500).json({ message: 'Failed to fetch record' });
    }
});

// Delete event
app.delete('/residents_attendance/:_id', async (req, res) => {
    const { _id } = req.params;

    // Validate the _id format
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ message: 'Invalid attendance record ID' });
    }

    try {
        const attendanceRecord = await ResidentAttendance.findByIdAndDelete(_id);
        if (!attendanceRecord) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
        res.status(200).json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        console.error('Error deleting attendance record:', error);
        res.status(500).json({ message: 'Failed to delete attendance record' });
    }
});



const fetchOfficialDetails = async (officialId) => {
    try {
        const official = await Official.findById(officialId);
        if (!official) {
            throw new Error('Official not found');
        }
        return official;
    } catch (error) {
        console.error('Error fetching official details:', error);
        throw error;
    }
}

const saveOfficialAttendanceDetails = async (official, eventId) => {
    try {
        // Format the current time to exclude milliseconds
        const currentTime = new Date();
        const formattedTime = new Date(
            currentTime.getFullYear(),
            currentTime.getMonth(),
            currentTime.getDate(),
            currentTime.getHours(),
            currentTime.getMinutes(),
            currentTime.getSeconds()
        );

        // Check if an attendance record already exists with the same residentId, eventId, and time
        const existingAttendance = await OfficialAttendance.findOne({
            officialId: official._id,
            eventId: eventId,
            time: formattedTime,
        });

        // Check if the time difference is less than or equal to 5 seconds
        if (existingAttendance) {
            const timeDifference = Math.abs(new Date(existingAttendance.time) - formattedTime) / 1000; // Difference in seconds
            if (timeDifference <= 5) {
                throw new Error('Attendance already recorded for this resident and event within 5 seconds');
            }
        }

        // Create the attendance record
        const attendance = {
            officialId: official._id,
            fullname: official.fullname,
            position: official.position,
            phone: official.phone,
            eventId: eventId,
            time: formattedTime, // Use formatted time
        };

        await OfficialAttendance.create(attendance);
        return attendance;
    } catch (error) {
        console.error('Error saving attendance details:', error);
        throw error;
    }
};

// Endpoint to handle attendance recording
app.post('/attendance_officials', async (req, res) => {
    const { officialId, eventId } = req.body;

    if (!officialId || !eventId) { // Check if either officialId or eventId is missing
        return res.status(400).json({ message: 'Official ID and Event ID are required' });
    }

    try {
        // Fetch resident details
        const official = await fetchOfficialDetails(officialId);

        // Save attendance details
        const attendance = await saveOfficialAttendanceDetails(official, eventId);

        // Respond with the attendance details
        res.status(201).json({ message: 'Attendance recorded successfully', attendance });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to fetch attendance for a specific event
app.get('/officials_attendance', async (req, res) => {
    try {
        const officialsAttendance = await OfficialAttendance.find(); // Fetch all attendance records
        res.status(200).json(officialsAttendance);
    } catch (error) {
        console.error('Error fetching officials attendance:', error);
        res.status(500).json({ message: 'Failed to fetch officials attendance' });
    }
});

// Delete event
app.delete('/officials_attendance/:_id', async (req, res) => {
    try {
        const attendanceRecord = await OfficialAttendance.findByIdAndDelete(req.params._id);
        if (!attendanceRecord) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }
        res.status(200).json({ message: 'Attendance record deleted successfully' });
    } catch (error) {
        console.error('Error deleting attendance record:', error);
        res.status(500).json({ message: 'Failed to delete attendance record' });
    }
});


// Log registered routes for debugging
if (app._router && app._router.stack) {
    app._router.stack.forEach((middleware) => {
        if (middleware.route) { // If middleware has a route
            console.log(`✅ Registered Route: ${middleware.route.path}`);
        }
    });
} else {
    console.log('No routes registered.');
}

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});