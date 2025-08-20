import Channel from "../models/channel.model.js";
import User from "../models/user.model.js";
import { successResponse, errorResponse } from "../utils/httpResponse.js";

export const createChannel = async (req, res) => {
  try {
    const { name, members } = req.body;
    const { userId } = req.user;

    const validUsers = await User.find({ _id: { $in: members } });
    if (validUsers.length !== members.length)
      throw { status: 400, message: "Some members are invalid users." };

    members.push(userId); // Add the creator to the members list

    const newChannel = await Channel.create({
      name,
      members,
      admin: userId
    })

    return successResponse({
      res,
      status: 200,
      message: "Channel created successfully.",
      data: newChannel
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

export const getUserChannels = async (req, res) => {
  try {
    const { userId } = req.user;

    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }]
    }).sort({ updatedAt: -1 });

    return successResponse({
      res,
      status: 200,
      message: "User channels fetched successfully.",
      data: channels
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
