const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "rythu-connect-secret";

const staticRoot = path.resolve(__dirname);
const uploadDir = path.join(staticRoot, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        cb(null, `${Date.now()}-${file.fieldname}${extension}`);
    }
});

const upload = multer({ storage });

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
    cropImage: { type: String, default: "https://via.placeholder.com/300x200" },
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
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

function authorizeRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
}

// ============ ROUTES ============

// AUTH ROUTES
app.post("/api/auth/register", async (req, res) => {
    try {
        const { fullName, email, password, phone, role, village, state } = req.body;
        
        if (!fullName || !email || !password || !role) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: "Email already exists" });
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ fullName, email, password: hashedPassword, phone, role, village, state });
        await user.save();
        
        res.json({ message: "User registered successfully", user: { _id: user._id, email: user.email, role: user.role, fullName: user.fullName, village: user.village, state: user.state } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        const isMatch = user ? await bcrypt.compare(password, user.password) : false;

        if (!user || !isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                village: user.village,
                state: user.state
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CROP ROUTES
app.post("/api/crops", upload.single("cropImage"), async (req, res) => {
    try {
        const certifications = req.body.certifications
            ? String(req.body.certifications).split(",").map(c => c.trim()).filter(Boolean)
            : [];

        const cropData = {
            farmerId: req.body.farmerId,
            farmerName: req.body.farmerName,
            cropName: req.body.cropName,
            description: req.body.description,
            quantity: Number(req.body.quantity),
            unit: req.body.unit || "kg",
            pricePerUnit: Number(req.body.pricePerUnit),
            village: req.body.village,
            state: req.body.state,
            harvestDate: req.body.harvestDate || undefined,
            certifications,
            cropImage: req.file ? `/uploads/${req.file.filename}` : "https://via.placeholder.com/300x200"
        };

        const crop = new Crop(cropData);
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
        
        const crops = await Crop.find(query).sort({ createdAt: -1 });
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

app.put("/api/crops/:id", upload.single("cropImage"), async (req, res) => {
    try {
        const certifications = req.body.certifications
            ? String(req.body.certifications).split(",").map(c => c.trim()).filter(Boolean)
            : undefined;

        const updateData = {
            cropName: req.body.cropName,
            description: req.body.description,
            quantity: req.body.quantity ? Number(req.body.quantity) : undefined,
            unit: req.body.unit,
            pricePerUnit: req.body.pricePerUnit ? Number(req.body.pricePerUnit) : undefined,
            village: req.body.village,
            state: req.body.state,
            harvestDate: req.body.harvestDate || undefined,
            certifications,
        };

        if (req.file) {
            updateData.cropImage = `/uploads/${req.file.filename}`;
        }

        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const crop = await Crop.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
        const { buyerId, cropId, cropName, farmerId, farmerName, quantity, totalPrice, deliveryAddress, expectedDelivery } = req.body;

        const crop = await Crop.findById(cropId);
        if (!crop) {
            return res.status(404).json({ error: "Crop not found" });
        }

        const orderQuantity = Number(quantity);
        if (!orderQuantity || orderQuantity <= 0 || orderQuantity > crop.quantity) {
            return res.status(400).json({ error: "Invalid order quantity" });
        }

        crop.quantity = crop.quantity - orderQuantity;
        await crop.save();

        const orderId = "ORD-" + Date.now();
        const order = new Order({
            orderId,
            buyerId,
            cropId,
            cropName,
            farmerId,
            farmerName,
            quantity: orderQuantity,
            totalPrice,
            deliveryAddress,
            expectedDelivery,
            status: "pending"
        });

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

app.put("/api/users/:id", async (req, res) => {
    try {
        const { fullName, phone, village, state } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { fullName, phone, village, state },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});