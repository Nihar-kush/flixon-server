import express from "express";
import { getMovies } from "../functions/getMovies.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  res.send("Welcome to Flixon!!!");
});

router.get("/api/movies", getMovies);

export default router;
