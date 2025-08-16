import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { successResponse, errorResponse } from "../utils/httpResponse.js"

export const searchContacts = async (req, res) => {
  try {
    const { query } = req.body;
    const { userId } = req.user;

    if (!query)
      throw { status: 400, message: "Query is required." }

    const sanitizedQuery = query.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    )

    const regex = new RegExp(sanitizedQuery, "i");

    const contacts = await User.find({
      $and: [
        {
          _id: { $ne: userId }
        },
        {
          $or: [{ firstName: regex }, { lastName: regex }, { email: regex }]
        }
      ]
    }).select("-password -__v -createdAt -updatedAt");

    return successResponse({
      res,
      status: 200,
      message: "Contacts found successfully.",
      data: contacts
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

export const getContactsForDmList = async (req, res) => {
  try {
    let { userId } = req.user;
    userId = new mongoose.Types.ObjectId(userId);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userId },
            { recipient: userId }
          ]
        },
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender"
            },
          },
          lastMessageTime: { $first: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo"
        },
      },
      {
        $unwind: "$contactInfo"
      },
      {
        $lookup: {
          from: "messages",
          let: { contactId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$sender", "$$contactId"] },
                    { $eq: ["$recipient", userId] },
                    { $eq: ["$seen", false] }
                  ],
                },
              },
            },
            { $count: "unseenCount" }
          ],
          as: "unseenMessages"
        },
      },
      {
        $addFields: {
          unseenCount: {
            $ifNull: [{ $arrayElemAt: ["$unseenMessages.unseenCount", 0] }, 0]
          }
        }
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          unseenCount: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          profileColor: "$contactInfo.profileColor",
          profilePic: "$contactInfo.profilePic",
        },
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ])

    return successResponse({
      res,
      status: 200,
      message: "Contacts retrieved successfully for DM.",
      data: contacts
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

export const addToContact = async ({ userId, contactId }) => {
  try {
    const contact = await Contact.findOne({ user: userId });

    if (!contact) {
      // If no contact document exists, create one
      const newContact = new Contact({
        user: userId,
        contacts: [contactId]
      });
      await newContact.save();
    } else {
      // If contact document exists, add the new contact
      if (!contact.contacts.includes(contactId)) {
        contact.contacts.push(contactId);
        await contact.save();
      }
    }

  } catch (error) {
    console.log(error)
  }
}