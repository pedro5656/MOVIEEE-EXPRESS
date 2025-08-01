import { Router } from "express";
import Movie from "../schemas/Movie.js";
import User from "../schemas/User.js";
import fs from 'fs';
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { ensureAuthenticated as ensureUserIsAuthenticated } from "../middleware/authMiddleware.js";



const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

const router = Router();
const upload = multer({ dest: "upload/" });

router.get('/api/movies', async (req, res) => {
    const movies = await Movie.find().sort({ createdAt: 1 });
    res.json(movies);
});

router.post("/movies", upload.single("image"), ensureUserIsAuthenticated, async (req, res, next) => {
    try {
        const { title, description, rating, budget, revenue } = req.body;
        if (!title || !description || !rating || !budget || !revenue) {
            return res.status(400).json({ message: "Please fill in all fields" });
        }
        const existingMovie = await Movie.find({ title });
        if (existingMovie.length > 0) {
            return res.status(400).json({ message: "Movie already exists" });
        }
        const file = req.file;
        let imageUrl = "";
        if (file) {
            const filePath = file.path;
            const result = await cloudinary.uploader.upload(filePath, { folder: "movies" });
            fs.unlinkSync(filePath);
            imageUrl = result.secure_url;
        }
        const movie = await Movie.create({
            title,
            description,
            imageUrl,
            rating,
            budget,
            revenue,
        });
        res.redirect("/");
    } catch (error) {
        console.error("Error creating movie:", error);
        next(error);
    }
});

router.get("/", (req, res) => {
    res.send("Welcome to our API");
});

router.get("/movies", (req, res) => {
    res.send("Here are your movies for api");
});

export default router;