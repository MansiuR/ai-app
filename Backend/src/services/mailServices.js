import dotenv from 'dotenv';
dotenv.config();
import nodemailer from "nodemailer";

// Validate required OAuth2 credentials
function validateOAuth2Credentials() {
    const required = ['GOOGLE_USER', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error("❌ Missing OAuth2 credentials:", missing);
        console.error("Please set these in your .env file:");
        console.error("  - GOOGLE_USER");
        console.error("  - GOOGLE_CLIENT_ID");
        console.error("  - GOOGLE_CLIENT_SECRET");
        console.error("  - GOOGLE_REFRESH_TOKEN");
        return false;
    }
    return true;
}

// Initialize transporter with OAuth2 (same as your original working code)
let transporter;

if (validateOAuth2Credentials()) {
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: 'OAuth2',
            user: process.env.GOOGLE_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken: process.env.GOOGLE_ACCESS_TOKEN
        }
    });
    
    console.log("✅ Email transporter initialized with OAuth2");
} else {
    console.error("⚠️  Email service will not work - OAuth2 not configured");
}

// Verify connection
if (transporter) {
    transporter.verify()
        .then(() => { 
            console.log("✅ Email transporter is ready to send emails"); 
        })
        .catch((err) => { 
            console.error("❌ Email transporter verification failed:", err.message);
            console.error("Check your OAuth2 credentials in .env file");
        });
}

export async function sendEmail({ to, subject, html, text }) {
    try {
        if (!transporter) {
            console.error("❌ Email transporter not initialized");
            throw new Error("Email service not configured - OAuth2 credentials missing");
        }

        console.log(`📧 Sending email to: ${to}`);
        console.log(`📧 Subject: ${subject}`);

        const mailOptions = {
            from: process.env.GOOGLE_USER,
            to,
            subject,
            html,
            text
        };

        const details = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}`);
        console.log(`📧 Message ID: ${details.messageId}`);
        return details;
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error.message);
        throw error;
    }
}