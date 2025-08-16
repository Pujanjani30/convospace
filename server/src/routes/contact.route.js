import { Router } from "express";
import { searchContacts, getContactsForDmList } from "../controllers/contact.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const contactRoutes = Router();

contactRoutes.post("/search", verifyToken, searchContacts);
contactRoutes.get("/get-dm-contacts", verifyToken, getContactsForDmList);

export default contactRoutes;