import dotenv from "dotenv";
import connectDB from "./db/mongoDB.js";

dotenv.config({
    path: './env'
});

connectDB();