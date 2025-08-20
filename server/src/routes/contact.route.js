import { Router } from "express";
import { searchContacts, getContactsForDmList, getAllContacts } from "../controllers/contact.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const contactRoutes = Router();

contactRoutes.get("/get-dm-contacts", verifyToken, getContactsForDmList);
contactRoutes.get("/get-all-contacts", verifyToken, getAllContacts);

contactRoutes.post("/search", verifyToken, searchContacts);

export default contactRoutes;