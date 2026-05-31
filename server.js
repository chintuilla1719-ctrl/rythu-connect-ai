const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

const staticRoot = path.resolve(__dirname);
app.use(cors());
app.use(express.json());
app.use(express.static(staticRoot));
app.get("/", (req, res) => {
    res.sendFile(path.join(staticRoot, "index.html"));
});
app.get("/index.html", (req, res) => {
    res.sendFile(path.join(staticRoot, "index.html"));
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/rythu-connect", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB connection error:", err));

// ============ SCHEMAS ============

// User Schema (Farmer & Buyer)
const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    role: { type: String, enum: ["farmer", "buyer"] },
    village: String,
    state: String,
    profilePhoto: String,
    createdAt: { type: Date, default: Date.now }
});

// Crop Schema
const cropSchema = new mongoose.Schema({
    farmerId: mongoose.Schema.Types.ObjectId,
    farmerName: String,
    cropName: String,
    description: String,
    quantity: Number,
    unit: { type: String, default: "kg" },
    pricePerUnit: Number,
    cropImage: String,
    village: String,
    state: String,
    harvestDate: Date,
    certifications: [String],
    createdAt: { type: Date, default: Date.now }
});

// Order Schema
const orderSchema = new mongoose.Schema({
    orderId: String,
    buyerId: mongoose.Schema.Types.ObjectId,
    farmerId: mongoose.Schema.Types.ObjectId,
    farmerName: String,
    cropId: mongoose.Schema.Types.ObjectId,
    cropName: String,
    quantity: Number,
    totalPrice: Number,
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered"], default: "pending" },
    deliveryAddress: String,
    orderDate: { type: Date, default: Date.now },
    expectedDelivery: Date
});

const User = mongoose.model("User", userSchema);
const Crop = mongoose.model("Crop", cropSchema);
const Order = mongoose.model("Order", orderSchema);

// ============ ROUTES ============

// AUTH ROUTES
app.post("/api/auth/register", async (req, res) => {
    try {
        const { fullName, email, password, phone, role, village, state } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: "Email already exists" });
        
        const user = new User({ fullName, email, password, phone, role, village, state });
        await user.save();
        
        res.json({ message: "User registered successfully", user: { _id: user._id, email: user.email, role: user.role, fullName: user.fullName, village: user.village, state: user.state } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || user.password !== password) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        
        res.json({ message: "Login successful", user: { _id: user._id, email: user.email, role: user.role, fullName: user.fullName, village: user.village, state: user.state } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CROP ROUTES
app.post("/api/crops", async (req, res) => {
    try {
        const crop = new Crop(req.body);
        await crop.save();
        res.json({ message: "Crop listed successfully", crop });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/crops", async (req, res) => {
    try {
        const { search, minPrice, maxPrice, state, farmerId } = req.query;
        let query = {};
        
        if (search) query.cropName = { $regex: search, $options: "i" };
        if (minPrice || maxPrice) {
            query.pricePerUnit = {};
            if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
            if (maxPrice) query.pricePerUnit.$lte = Number(maxPrice);
        }
        if (state) query.state = state;
        if (farmerId) query.farmerId = farmerId;
        
        const crops = await Crop.find(query);
        res.json(crops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/crops/:id", async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);
        res.json(crop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/api/crops/:id", async (req, res) => {
    try {
        const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Crop updated successfully", crop });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete("/api/crops/:id", async (req, res) => {
    try {
        await Crop.findByIdAndDelete(req.params.id);
        res.json({ message: "Crop deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ORDER ROUTES
app.post("/api/orders", async (req, res) => {
    try {
        const orderId = "ORD-" + Date.now();
        const order = new Order({ orderId, ...req.body });
        await order.save();
        res.json({ message: "Order placed successfully", order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/orders", async (req, res) => {
    try {
        const { buyerId, farmerId } = req.query;
        let query = {};
        if (buyerId) query.buyerId = buyerId;
        if (farmerId) query.farmerId = farmerId;
        
        const orders = await Order.find(query);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/orders/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/api/orders/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Order updated successfully", order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// USER ROUTES
app.get("/api/users/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});