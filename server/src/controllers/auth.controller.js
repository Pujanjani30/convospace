import User from "../models/user.model.js"
import { successResponse, errorResponse } from "../utils/httpResponse.js"
import { generateJwtToken } from "../utils/jwtToken.js"
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"

const maxAge = 3 * 24 * 60 * 60 * 1000;

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      throw { status: 400, message: "Email and password are required." }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      throw { status: 409, message: "User with this email already exists." }

    const user = await User.create({ email, password });

    res.cookie("token", generateJwtToken({ userId: user._id, email }), {
      maxAge,
      secure: true,
      sameSite: "None"
    })

    return successResponse({
      res,
      status: 201,
      message: "User signed up successfully.",
      data: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileColor: user.profileColor,
        profilePic: user.profilePic,
        profileSetupStatus: user.profileSetupStatus,
        createdAt: user.createdAt
      }
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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      throw { status: 400, message: "Email and password are required." }

    const existingUser = await User.findOne({ email });
    if (!existingUser)
      throw { status: 401, message: "Invalid email or password." }

    const isMatch = await existingUser.comparePassword(password);
    if (!isMatch)
      throw { status: 401, message: "Invalid email or password." }

    res.cookie("token", generateJwtToken({ userId: existingUser._id, email }), {
      maxAge,
      secure: true,
      sameSite: "None"
    })

    return successResponse({
      res,
      status: 200,
      message: "User logged in successfully.",
      data: {
        _id: existingUser._id,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        profileColor: existingUser.profileColor,
        profilePic: existingUser.profilePic,
        profileSetupStatus: existingUser.profileSetupStatus,
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt
      }
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

export const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.user;

    const userData = await User.findById(userId).select("-password");
    if (!userData)
      throw { status: 404, message: "User not found." }

    return successResponse({
      res,
      status: 200,
      message: "User information retrieved successfully.",
      data: userData
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

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { firstName, lastName, profileColor } = req.body;

    if (!firstName || !lastName || profileColor === undefined)
      throw { status: 400, message: "First name, last name, and profile color are required." }

    const userData = await User.findByIdAndUpdate(userId, {
      firstName,
      lastName,
      profileColor,
      profileSetupStatus: true
    }, { new: true, runValidators: true }).select("-password");

    return successResponse({
      res,
      status: 200,
      message: "User profile updated successfully.",
      data: userData
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

export const addProfilePic = async (req, res) => {
  try {
    const file = req.file;
    if (!file)
      throw { status: 400, message: "Profile picture is required." }

    const { url: fileURL } = await uploadToCloudinary(file.buffer, "ConvoSpace/profiles");

    console.log("fileURL", fileURL);

    const { userId } = req.user;
    const userData = await User.findByIdAndUpdate(userId, {
      profilePic: fileURL
    }, { new: true, runValidators: true }).select("-password");

    return successResponse({
      res,
      status: 200,
      message: "Profile picture added successfully.",
      data: userData.profilePic
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

export const removeProfilePic = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);
    if (!user)
      throw { status: 404, message: "User not found." }

    if (user.profilePic)
      await deleteFromCloudinary(user.profilePic);

    user.profilePic = null;

    await user.save();

    return successResponse({
      res,
      status: 200,
      message: "Profile picture removed successfully."
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

export const logout = async (req, res) => {
  try {

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    });

    return successResponse({
      res,
      status: 200,
      message: "Logout successful."
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