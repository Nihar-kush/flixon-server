import express from "express";
import moviesRoute from "./routes/movies.js";
import cors from "cors";
import 'dotenv/config'

// CONFIGURATIONS
const app = express();

//MIDDLEWARES
app.use(
  cors({
    origin: ["http://localhost:3000", "https://flixon.netlify.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/", moviesRoute);

// SERVER CONNECTION
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
