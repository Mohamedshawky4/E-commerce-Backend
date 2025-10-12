import express from "express";
import { registerUser , loginUser, getUserProfile,
     uploadUserAvatar, addUserAddress, updateUserAddress,
      deleteUserAddress, setDefaultUserAddress, getUserAddresses,
      updateUserProfile, getAllUsers, deleteUserById, updateUserRoleById, getUserById } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
const userRoutes = express.Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.get("/profile",protect, getUserProfile);
userRoutes.put("/profile", protect, updateUserProfile);
userRoutes.post("/upload-avatar", protect, uploadUserAvatar);
userRoutes.post("/address", protect, addUserAddress);
userRoutes.put("/address/:addressId", protect, updateUserAddress);
userRoutes.delete("/address/:addressId", protect, deleteUserAddress);
userRoutes.put("/address/:addressId/set-default", protect, setDefaultUserAddress);
userRoutes.get("/addresses", protect, getUserAddresses);
userRoutes.get("/", protect, admin, getAllUsers);
userRoutes.delete("/:userId", protect, admin, deleteUserById);
userRoutes.put("/:userId/role", protect, admin, updateUserRoleById);
userRoutes.get("/:userId", protect, admin, getUserById);
export default userRoutes;