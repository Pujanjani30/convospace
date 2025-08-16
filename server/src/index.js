import 'dotenv/config'
import express from "express"
import cors from "cors"
import cookieParser from 'cookie-parser'

import './configs/db.config.js'

import setupSocket from './socket.js'

import { authRoutes, contactRoutes, messageRoutes } from "./routes/index.js"

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
  origin: process.env.ORIGIN,
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/public/uploads/profiles', express.static('public/uploads/profiles'));
app.use('/public/uploads/files', express.static('public/uploads/files'));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messageRoutes);

app.use(/(.*)/, (req, res) => {
  return res.status(404).send("404 Not Found!")
})

const server = app.listen(port, () => {
  console.log(`Server is running on ${port}...`)
})

setupSocket(server);