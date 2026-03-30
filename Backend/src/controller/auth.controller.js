import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mailServices.js";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export async function register(req, res) {
    console.log("\n====== REGISTRATION START ======");
    console.log("Request body:", req.body);
    
    try {
        const { username, email, password } = req.body;

        console.log("Step 1: Parsed input", { username, email, hasPassword: !!password });

        // Validate input
        if (!username || !email || !password) {
            console.log("Step 2: Validation failed - missing fields");
            return res.status(400).json({
                message: "Username, email, and password are required",
                success: false,
                err: "Missing fields"
            })
        }

        console.log("Step 3: Checking if user already exists");
        const isUserAlreadyExists = await userModel.findOne({
            $or: [ { email }, { username } ]
        })

        if (isUserAlreadyExists) {
            console.log("Step 4: User already exists");
            return res.status(400).json({
                message: "User with this email or username already exists",
                success: false,
                err: "User already exists"
            })
        }

        console.log("Step 5: Creating user in database");
        const user = await userModel.create({ 
            username, 
            email, 
            password,
            verified: false
        })
        console.log("Step 6: ✅ User created successfully:", user._id);
        console.log("Step 6b: User verified status:", user.verified);

        const emailVerificationToken = jwt.sign({
            email: user.email,
        }, process.env.JWT_SECRET)

        const backendUrl = process.env.BACKEND_URL || "http://localhost:5000"

        console.log("Step 7: Attempting to send verification email...");
        try {
            if (!process.env.GOOGLE_USER) {
                console.warn("⚠️  WARNING: GOOGLE_USER environment variable not set");
            }

            await sendEmail({
                to: email,
                subject: "Welcome to Perplexity! - Verify Your Email",
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to Perplexity! 🚀</h2>
                    <p>Hi <strong>${username}</strong>,</p>
                    <p>Thank you for registering at <strong>Perplexity</strong>. We're excited to have you on board!</p>
                    <p><strong>Please verify your email address by clicking the link below:</strong></p>
                    <p style="margin: 20px 0;">
                        <a href="${backendUrl}/api/auth/verify-email?token=${emailVerificationToken}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                    </p>
                    <p>If you did not create an account, please ignore this email.</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">Best regards,<br><strong>The Perplexity Team</strong></p>
                </div>
                `
            })
            console.log("Step 8: ✅ Verification email sent to:", email);
        } catch (emailError) {
            console.error("Step 8: ❌ Email sending failed:", emailError.message);
            console.log("Step 8b: Continuing with registration despite email failure");
        }

        console.log("Step 9: Sending success response");
        res.status(201).json({
            message: "User registered successfully! Please check your email to verify your account.",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified
            }
        });
        console.log("====== REGISTRATION SUCCESS ======\n");
        
    } catch (error) {
        console.error("❌ REGISTRATION ERROR:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        res.status(500).json({
            message: "Server error during registration",
            success: false,
            err: error.message
        })
    }
}

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
                success: false,
                err: "Missing credentials"
            })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "User Not Found! Please register first",
                success: false,
                err: "User not found"
            })
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false,
                err: "Incorrect password"
            })
        }

        if (!user.verified) {
            return res.status(400).json({
                message: "Please verify your email before logging in",
                success: false,
                err: "Email not verified"
            })
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username,
        }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.status(200).json({
            message: "Login successful",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Server error during login",
            success: false,
            err: error.message
        })
    }
}


/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}


/**
 * @desc Verify user's email address
 * @route GET /api/auth/verify-email
 * @access Public
 * @query { token }
 */
export async function verifyEmail(req, res) {
    const { token } = req.query;

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid token",
                success: false,
                err: "User not found"
            })
        }

        user.verified = true;

        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173"
        const html =
            `
        <h1>Email Verified Successfully!</h1>
        <p>Your email has been verified. You can now log in to your account.</p>
        <a href="${frontendUrl}/login">Go to Login</a>
    `

        return res.send(html);
    } catch (err) {
        return res.status(400).json({
            message: "Invalid or expired token",
            success: false,
            err: err.message
        })
    }
}

/**
 * @desc Manually verify user email (for testing)
 * @route POST /api/auth/manual-verify
 * @access Public (for testing only)
 * @body { email }
 */
export async function manualVerifyEmail(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false,
                err: "Missing email"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                err: "User not found"
            });
        }

        user.verified = true;
        await user.save();

        res.status(200).json({
            message: "Email verified successfully",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified
            }
        });
    } catch (error) {
        console.error("Manual verify error:", error);
        res.status(500).json({
            message: "Server error during verification",
            success: false,
            err: error.message
        });
    }
}

/**
 * @desc Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Public
 * @body { email }
 */
export async function resendVerificationEmail(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                success: false,
                err: "Missing email"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
                err: "User not found"
            });
        }

        if (user.verified) {
            return res.status(400).json({
                message: "Email already verified",
                success: false,
                err: "Already verified"
            });
        }

        const emailVerificationToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET
        );

        const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";

        try {
            await sendEmail({
                to: email,
                subject: "Verify Your Email - Perplexity",
                html: `
                    <h2>Email Verification</h2>
                    <p>Hi ${user.username},</p>
                    <p>Please verify your email by clicking the link below:</p>
                    <a href="${backendUrl}/api/auth/verify-email?token=${emailVerificationToken}">
                        Verify Email
                    </a>
                    <p>Link expires in 24 hours.</p>
                    <p>Best regards,<br>The Perplexity Team</p>
                `
            });

            res.status(200).json({
                message: "Verification email sent successfully",
                success: true
            });
        } catch (emailError) {
            console.error("Failed to resend verification email:", emailError);
            res.status(500).json({
                message: "Failed to send verification email",
                success: false,
                err: emailError.message
            });
        }
    } catch (error) {
        console.error("Resend verification error:", error);
        res.status(500).json({
            message: "Server error",
            success: false,
            err: error.message
        });
    }
}