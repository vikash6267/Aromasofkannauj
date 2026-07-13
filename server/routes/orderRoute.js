const express = require("express");
const router = express.Router();
const { createOrder, getAllOrders, getUserOrders, getOrderById, updateOrder } = require("../controllers/orderCtrl");

router.post("/create", createOrder);
router.get("/getAll", getAllOrders);
router.get("/user/:userId", getUserOrders);
router.get("/get/:id", getOrderById);
router.put("/update/:id", updateOrder);

module.exports = router;
