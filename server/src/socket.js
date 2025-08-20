import { Server as SocketIOServer } from "socket.io"
import Message from "./models/message.model.js"
import Channel from "./models/channel.model.js"
import User from "./models/user.model.js"

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      credentials: true,
    },
    path: "/socket.io"
  });

  const userSocketMap = new Map();
  const onlineUsers = new Set();

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    const createdMessage = await Message.create(message);

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "_id email firstName lastName profilePic profileColor")
      .populate("recipient", "_id email firstName lastName profilePic profileColor");

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receiveMessage", messageData);
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("receiveMessage", messageData);
    }

  };

  const sendChannelMessage = async (message) => {
    const { sender, channelId, content, messageType, fileUrl } = message;

    const createdMessage = await Message.create({
      sender,
      messageType,
      content,
      fileUrl,
      timestamp: new Date(),
    });

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "_id email firstName lastName profilePic profileColor");

    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createdMessage._id }
    });

    const channel = await Channel.findById(channelId)
      .populate("members", "_id email firstName lastName profilePic profileColor");


    const finalData = { ...messageData.toJSON(), channelId: channel._id }

    if (channel && channel.members) {
      channel.members.forEach(member => {
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          io.to(memberSocketId).emit("receiveChannelMessage", finalData);
        }
      });
    }

  };

  const updateUserStatus = (userId, isOnline) => {
    if (isOnline) {
      onlineUsers.add(userId);
    } else {
      onlineUsers.delete(userId);
    }

    // Broadcast status change to all connected clients
    io.emit("userStatusChanged", { userId, isOnline });
  }

  const disconnect = (socket) => {
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        updateUserStatus(userId, false); // Set user as offline
        console.log(`User ${userId} disconnected.`);
        break;
      }
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      updateUserStatus(userId, true); // Set user as online

      // Send current online users list to the newly connected user
      socket.emit("onlineUsers", Array.from(onlineUsers));

      console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    } else {
      console.warn("User ID not provided in handshake query");
    }

    // Handle typing indicators
    socket.on("typing", (data) => {
      const recipientSocketId = userSocketMap.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("userTyping", {
          user: { userId },
          isTyping: data.isTyping,
          // selectedChatType: "dm"
        });
      }
    });

    // socket.on("channelTyping", async (data) => {
    //   const { channelId, isTyping, userId } = data;

    //   const channel = await Channel.findById(channelId)
    //     .populate("members", "_id firstName lastName");

    //   let user = await User.findById(userId);

    //   if (!channel || !user) {
    //     console.warn("Channel or user not found for typing event");
    //     return;
    //   }

    //   user = { userId: user._id, firstName: user.firstName, lastName: user.lastName };

    //   if (channel && channel.members) {
    //     channel.members.forEach(member => {
    //       const memberSocketId = userSocketMap.get(member._id.toString());
    //       if (memberSocketId && member._id.toString() !== userId) {
    //         io.to(memberSocketId).emit("userTyping", { user, isTyping, selectedChatType: "channel" });
    //       }
    //     });
    //   }
    // });

    socket.on("sendMessage", sendMessage);
    socket.on("sendChannelMessage", sendChannelMessage);

    socket.on("disconnect", () => disconnect(socket))
  });

}

export default setupSocket;