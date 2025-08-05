import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ where: { email } });
        if (user) return res.status(400).json({ message: "Email already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullname: fullName,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            generateToken(newUser.id, res)
            await newUser.save();

            res.status(201).json({
                id: newUser.id,
                fullName: newUser.fullname,
                email: newUser.email,
                profilePic: newUser.profilepic,
                createdAt: newUser.createdAt,
            });

        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) {
            return res.status(404).json({ message: "Invalid credentials" });
        }

        generateToken(user.id, res)

        res.status(200).json({
            id: user.id,
            fullName: user.fullname,
            email: user.email,
            profilePic: user.profilepic,
            createdAt: user.createdAt,
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user.id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        await User.update({ profilepic: uploadResponse.secure_url }, { where: { id: userId } });

        const updateUser = await User.findByPk(userId, {
            attributes: { exclude: ["password"] },
        });

        const userObj = updateUser.toJSON();
        userObj.profilePic = userObj.profilepic;
        userObj.fullName = userObj.fullname;
        delete userObj.profilepic;
        delete userObj.fullname;

        res.status(200).json(userObj);
    } catch (error) {
        console.log("Error in update profile", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const userObj = req.user.toJSON();
        userObj.profilePic = userObj.profilepic;
        userObj.fullName = userObj.fullname;
        delete userObj.profilepic;
        delete userObj.fullname;
        res.status(200).json(userObj);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};