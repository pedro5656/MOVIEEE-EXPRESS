import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import methodOverride from 'method-override';
import { v2 as cloudinary } from 'cloudinary';
import { connectDB } from './db.js';
import apiRouter from './routes/apiRouter.js';
import pageRouter from './routes/pageRouter.js';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from './schemas/User.js';
import session from 'express-session';
import flash from 'connect-flash';



dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

try {
  await connectDB();
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Failed to connect to MongoDB:", error.message);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

const app = express();

// In-memory store for sessions
app.set("view engine", "ejs");
app.set("views", path.join(_dirname, "views"));
app.use(express.static(path.join(_dirname, "Public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: 'User not found' });

    const isValid = await user.isValidPassword(password);
    if (!isValid) return done(null, false, { message: 'Invalid password' });

    return done(null, user); // No verification check
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use((req, res, next) => {
  console.log("Authenticated:", req.isAuthenticated(), "User:", req.user?.email);
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.error = req.flash('error');
  next();
});

app.use("/", pageRouter);
app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  console.error("Error occurred:", err.message, err.stack);
  if (!res.headersSent) {
    res.status(500).send("Something went wrong!");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

export {}; // Empty export to satisfy module syntax