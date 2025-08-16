import Message from "../models/message.model.js";
import { mkdirSync, renameSync } from "fs";
import { successResponse, errorResponse } from "../utils/httpResponse.js"

export const getMessages = async (req, res) => {
  try {
    const user1 = req.user.userId;
    const user2 = req.query.userId;

    if (!user1 || !user2)
      throw { status: 400, message: "Both user IDs are required." }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 }
      ]
    }).sort({ timestamp: 1 });

    await Message.updateMany(
      { sender: user2, recipient: user1, seen: false },
      { $set: { seen: true } }
    );

    return successResponse({
      res,
      status: 200,
      message: "Messages fetched successfully.",
      data: messages
    })

  } catch (error) {
    console.log(error)
    return errorResponse({
      res,
      status: error.status || 500,
      message: error.message || "Internal server error."
    })
  }
}

export const updateUnSeenMessages = async (req, res) => {
  try {
    const user1 = req.user.userId;
    const user2 = req.body.userId;

    if (!user1 || !user2)
      throw { status: 400, message: "Both user IDs are required." }

    await Message.updateMany(
      { sender: user2, recipient: user1, seen: false },
      { $set: { seen: true } }
    );

    return successResponse({
      res,
      status: 200,
      message: "Success."
    });

  } catch (error) {
    console.log(error)
    return errorResponse({
      res,
      status: error.status || 500,
      message: error.message || "Internal server error."
    })
  }
}

export const uploadMessageFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file)
      throw { status: 400, message: "File is required." }

    const fileName = `public/uploads/files/${Date.now()}-${crypto.randomUUID()}.${file.originalname.split('.').pop()}`;
    mkdirSync('public/uploads/files', { recursive: true });
    renameSync(file.path, fileName);

    return successResponse({
      res,
      status: 200,
      message: "Success.",
      data: { filePath: fileName }
    });

  } catch (error) {
    console.log(error)
    return errorResponse({
      res,
      status: error.status || 500,
      message: error.message || "Internal server error."
    })
  }
} 