import dotenv from 'dotenv';
dotenv.config();
import nodemailer from "nodemailer";

let transporter;

// Initialize transporter
function initializeTransporter() {
    const config = {
        service: "gmail",
        auth: {
            user: process.env.GOOGLE_USER,
            pass: process.env.GMAIL_APP_PASSWORD || process.env.GOOGLE_CLIENT_SECRET,
        }
    };

    // Try OAuth2 first if credentials available
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN) {
        config.auth = {
            type: 'OAuth2',
            user: process.env.GOOGLE_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken: process.env.GOOGLE_ACCESS_TOKEN
        };
        console.log("Using OAuth2 authentication for Gmail");
    } else {
        console.log("Using basic auth for Gmail (App Password)");
    }

    return nodemailer.createTransport(config);
}

transporter = initializeTransporter();

// Verify connection
transporter.verify()
    .then(() => { 
        console.log("✅ Email transporter is ready to send emails"); 
    })
    .catch((err) => { 
        console.error("❌ Email transporter verification failed:", err.message); 
    });

export async function sendEmail({ to, subject, html, text }) {
    try {
        if (!process.env.GOOGLE_USER) {
            console.warn("⚠️  GOOGLE_USER not configured");
            return { messageId: "test-mode", accepted: [to] };
        }

        console.log(`📧 Preparing email for: ${to}`);

        const mailOptions = {
            from: `"Perplexity" <${process.env.GOOGLE_USER}>`,
            to,
            subject,
            html,
            text
        };

        const details = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}:`, details.messageId);
        return details;
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error.message);
        console.error("Full error:", error);
        throw new Error(`Email service error: ${error.message}`);
    }
}