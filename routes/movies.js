import express from "express";
import { getMovies } from "../functions/getMovies.js";
import { getMovieLink } from "../functions/getMovieLink.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  res.send("Welcome to Flixon.");
});

router.get("/api/movies", getMovies);
router.get("/api/movies/link", getMovieLink);

export default router;
