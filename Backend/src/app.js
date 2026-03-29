import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from "./routes/auth.routes.js";
import chatRouter from './routes/chat.routes.js';
import morgan from "morgan";
import cors from "cors";
import mongoose from 'mongoose';

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.static("./public"))

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

// Database status check
app.get("/api/health", (req, res) => {
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
        0: "Disconnected",
        1: "Connected",
        2: "Connecting",
        3: "Disconnecting"
    };
    
    res.json({
        message: "Health check",
        database: dbStates[dbStatus],
        status: dbStatus === 1 ? "OK" : "ERROR",
        timestamp: new Date().toISOString()
    });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found", path: req.path });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(500).json({
        message: "Internal server error",
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

export default app;