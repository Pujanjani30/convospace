import mongoose from "mongoose";
import bcryptjs from "bcryptjs"

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required."],
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  profilePic: {
    type: String,
    trim: true
  },
  profileColor: {
    type: String,
    trim: true
  },
  profileSetupStatus: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const user = this;

  return await bcryptjs.compare(candidatePassword, user.password);
}

export default mongoose.model('User', UserSchema);