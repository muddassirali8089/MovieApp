import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User must have a name"],
      trim: true,
      maxlength: [40, "Name must be less than 40 characters"],
      minlength: [3, "Name must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "User must have an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "User must have a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // hide password by default
    },
    confirmPassword: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    address: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default:
        "https://res.cloudinary.com/dujmvhjyt/image/upload/v1755785753/users/v1rron4l9ebzo2cwlr3x.jpg",
    },
    dateOfBirth: {
      type: Date,
    },


  },

  
  { timestamps: true }
);

/**
 * 🔹 Middleware: hash password before saving
 */
userSchema.pre("save", async function (next) {
  // Only run if password was modified
  if (!this.isModified("password")) return next();

  // Hash password
  this.password = await bcrypt.hash(this.password, 12);

  // Delete confirmPassword field (we don’t want it in DB)
  this.confirmPassword = undefined;

  next();
});

/**
 * 🔹 Instance Method: check if entered password is correct
 */
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};



const User = mongoose.model("User", userSchema);
export default User;
