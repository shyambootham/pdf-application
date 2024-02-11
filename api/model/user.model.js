import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://www.pinclipart.com/picdir/big/157-1578186_user-profile-default-image-png-clipart.png",
    },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);
export default User;
