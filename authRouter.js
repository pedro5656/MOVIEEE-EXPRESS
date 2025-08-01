import { Router } from "express";

const router = Router();

// Login User
router.get("/", async (req, res) => {
  res.render("login", {});
});

// Login User
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  console.log({ email, password });
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error', info ? info.message : 'Invalid credentials');
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
});

// Register User
router.get("/sign-up", async (req, res) => {
  res.render("register", {});
});

// Register User
router.post('/sign-up', async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, country } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.redirect('/sign-up?error=Email already exists');
    }

    const user = new User({ firstName, lastName, email, password, country, isVerified: true }); // Set isVerified to true
    await user.save();

    res.redirect('/login'); // Redirect to login after sign-up
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.redirect('/sign-up?error=' + encodeURIComponent(error.message));
  }
});

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/sign-up');
  });
});

export default router;