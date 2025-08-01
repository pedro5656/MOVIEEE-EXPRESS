import { Router } from "express";
import Movie from "../schemas/Movie.js";
import { formatCurrency, formatDateTime } from "../util/utility.js";
import passport from 'passport';
import User from "../schemas/User.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", ensureAuthenticated, async (req, res, next) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    const totalMovies = movies.length;
    const MovieDate = movies.map(movie => ({
      _id: movie._id,
      title: movie.title,
      description: movie.description.length > 200 ? movie.description.slice(0, 200) + "..." : movie.description,
      date: formatDateTime(movie.date || new Date()),
      imageUrl: movie.imageUrl,
      rating: movie.rating,
      budget: formatCurrency(movie.budget),
      revenue: formatCurrency(movie.revenue)
    }));
    res.render("home", { 
      movies: MovieDate, 
      totalMovies, 
      formatCurrency, 
      formatDateTime,
      user: req.user
    });
  } catch (error) {
    console.error("Error in root route:", error);
    next(error);
  }
});

router.get("/login", (req, res, next) => {
  console.log("Accessing /login route");
  try {
    res.render("login", { error: req.query.error });
  } catch (error) {
    console.error("Error rendering login page:", error);
    next(error);
  }
});

router.get("/sign-up", (req, res, next) => {
  console.log("Accessing /sign-up route");
  try {
    res.render("sign-up", { error: req.query.error });
  } catch (error) {
    console.error("Error rendering sign-up page:", error);
    next(error);
  }
});

// Create Movie Page
router.get("/movies/create", (req, res, next) => {
  console.log("Accessing /movies/create route");
  try {
    res.render("create_movie");
  } catch (error) {
    console.error("Error rendering create page:", error);
    next(error);
  }
});

router.get("/movies/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).send("Movie not found");
    }
    const newMovie = {
      _id: movie._id,
      title: movie.title,
      description: movie.description,
      date: formatDateTime(movie.date || new Date()),
      imageUrl: movie.imageUrl,
      rating: movie.rating,
      budget: formatCurrency(movie.budget),
      revenue: formatCurrency(movie.revenue)
    };
    res.render("movie", { movie: newMovie, formatCurrency, formatDateTime });
  } catch (error) {
    console.error("Error rendering movie page:", error);
    next(error);
  }
});

router.post(
  '/login',
  (req, res, next) => {
    console.log('Login attempt with:', req.body);
    next();
  },
  (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        req.flash('error', info ? info.message : 'Invalid credentials');
        return res.redirect('/login');
      } else {
        req.logIn(user, (err) => {
          if (err) return next(err);
          return res.redirect('/');
        });
      }
    })(req, res, next);
  }
);

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/sign-up');
  });
});

router.delete('/movies/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await Movie.findByIdAndDelete(id);
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting movie:', error);
    next(error);
  }
});


export default router;