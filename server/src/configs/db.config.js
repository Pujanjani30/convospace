import mongoose from "mongoose"

const DB_URL = process.env.DATABASE_URL;

mongoose.connect(DB_URL)
  .then(() => console.log("Connected to the database..."))
  .catch((err) => console.log(`Something went wrong! while connecting to the database... \nError: ${err}`))