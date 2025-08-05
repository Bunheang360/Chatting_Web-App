import cloudinary from "../lib/cloudinary.js";
import { Message } from "../models/index.js";
import { User } from "../models/index.js";
import { Op } from "sequelize";
import { io, getReceiverSocketId } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const filteredUsers = await User.findAll({
      where: { id: { [Op.ne]: loggedInUserId } },
      attributes: { exclude: ['password'] }
    });
    
    // Normalize the user data
    const normalizedUsers = filteredUsers.map(user => {
      const userObj = user.toJSON();
      return {
        ...userObj,
        fullName: userObj.fullname,
        profilePic: userObj.profilepic || "",
      };
    });

    res.status(200).json(normalizedUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user.id;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderID: myId, receiverID: userToChatId },
          { senderID: userToChatId, receiverID: myId }
        ]
      },
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json(messages)
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let imageUrl;
    if (image) {
      // upload to cloudinary first
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderID: senderId,
      receiverID: receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Real time functionality with socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log(`Attempting to send message to user ${receiverId}, socket ID: ${receiverSocketId}`);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      console.log("Message emitted to receiver");
    } else {
      console.log("Receiver not online or socket not found");
    }

    res.status(201).json(newMessage);

  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};