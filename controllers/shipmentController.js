import asyncHandler from "express-async-handler";
import Shipment from "../models/Shipment.js";
import Order from "../models/Order.js";

// @desc   Create a shipment for an order
// @route  POST /api/shipments
// @access Admin or system
export const createShipment = asyncHandler(async (req, res) => {
  const { orderId, courier, trackingNumber } = req.body;

  // Find the order
  const order = await Order.findById(orderId).populate("shippingAddress");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Create shipment with address snapshot
  const shipment = await Shipment.create({
    order: order._id,
    courier,
    trackingNumber,
    addressSnapshot: order.shippingAddress, // freeze address at time of shipping
    status: "preparing",
    shippedAt: new Date(),
  });

  res.status(201).json(shipment);
});


// @desc   Get all shipments (admin)
// @route  GET /api/shipments
// @access Admin
export const getShipments = asyncHandler(async (req, res) => {
  const shipments = await Shipment.find()
    .populate("order", "user totalPrice isPaid")
    .sort({ createdAt: -1 });
  res.json(shipments);
});


// @desc   Get single shipment by ID
// @route  GET /api/shipments/:id
// @access Admin or owner
export const getShipmentById = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id)
    .populate("order", "user totalPrice isPaid");
  if (!shipment) {
    res.status(404);
    throw new Error("Shipment not found");
  }
  res.json(shipment);
});


// @desc   Update shipment status (e.g. in_transit → delivered)
// @route  PUT /api/shipments/:id/status
// @access Admin or courier
export const updateShipmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) {
    res.status(404);
    throw new Error("Shipment not found");
  }

  shipment.status = status;

  if (status === "in_transit" && !shipment.shippedAt)
    shipment.shippedAt = new Date();

  if (status === "delivered") shipment.deliveredAt = new Date();

  await shipment.save();
  res.json(shipment);
});


// @desc   Delete shipment (rarely used)
// @route  DELETE /api/shipments/:id
// @access Admin
export const deleteShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  if (!shipment) {
    res.status(404);
    throw new Error("Shipment not found");
  }

  await shipment.deleteOne();
  res.json({ message: "Shipment deleted" });
});
