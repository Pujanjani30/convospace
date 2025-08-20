import { Router } from "express";
import { createChannel, getUserChannels } from "../controllers/channel.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const channelRoutes = Router();

channelRoutes.get("/get-user-channels", verifyToken, getUserChannels);

channelRoutes.post("/create", verifyToken, createChannel);

export default channelRoutes;