const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const ROOT = __dirname;
const ORDERS_FILE = path.join(ROOT, "orders.json");

app.use(express.json());
app.use(express.static(ROOT));

// Load previously saved orders
function loadOrders() {
    try {
        if (!fs.existsSync(ORDERS_FILE)) {
            fs.writeFileSync(ORDERS_FILE, "[]", "utf8");
        }

        const data = fs.readFileSync(ORDERS_FILE, "utf8");
        const savedOrders = JSON.parse(data);

        return Array.isArray(savedOrders) ? savedOrders : [];
    } catch (error) {
        console.error("Could not load orders:", error.message);
        return [];
    }
}

let orders = loadOrders();

// Save orders to disk
function saveOrders() {
    fs.writeFileSync(
        ORDERS_FILE,
        JSON.stringify(orders, null, 2),
        "utf8"
    );
}

// Main website
app.get("/", (req, res) => {
    res.sendFile(path.join(ROOT, "index.html"));
});

// Admin dashboard
app.get("/admin", (req, res) => {
    res.sendFile(path.join(ROOT, "admin.html"));
});

// Get all orders
app.get("/api/orders", (req, res) => {
    res.json(orders);
});

// Add a new order
app.post("/api/orders", (req, res) => {
    const order = req.body;

    if (!order || typeof order !== "object" || Array.isArray(order)) {
        return res.status(400).json({
            message: "Invalid order data"
        });
    }

    const newOrder = {
        ...order,
        id: Date.now().toString(),
        status: order.status || "pending",
        createdAt: new Date().toISOString()
    };

    orders.push(newOrder);

    try {
        saveOrders();
    } catch (error) {
        orders.pop();

        console.error("Could not save order:", error.message);

        return res.status(500).json({
            message: "Could not save order"
        });
    }

    res.status(201).json({
        message: "Order created",
        order: newOrder
    });
});

// Update order status
app.patch("/api/orders/:id/status", (req, res) => {
    const { status } = req.body;

    const allowedStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid order status"
        });
    }

    const order = orders.find(
        item => String(item.id) === req.params.id
    );

    if (!order) {
        return res.status(404).json({
            message: "Order not found"
        });
    }

    const previousStatus = order.status;
    order.status = status;

    try {
        saveOrders();
    } catch (error) {
        order.status = previousStatus;

        console.error("Could not save order status:", error.message);

        return res.status(500).json({
            message: "Could not save order status"
        });
    }

    res.json({
        message: "Order status updated",
        order
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`SK MarketPlace running at http://localhost:${PORT}`);
    console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
});