import express from "express";
import {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipmentStatus,
  deleteShipment,
} from "../controllers/shipmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const shipmentRoutes = express.Router();

shipmentRoutes.post("/", protect, createShipment);
shipmentRoutes.get("/", protect, admin, getShipments);
shipmentRoutes.get("/:id", protect, getShipmentById);
shipmentRoutes.put("/:id/status", protect, updateShipmentStatus);
shipmentRoutes.delete("/:id", protect, admin, deleteShipment);

export default shipmentRoutes;
