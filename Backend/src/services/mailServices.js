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
        console.log("✅ Using OAuth2 authentication for Gmail");
    } else {
        console.log("✅ Using basic auth for Gmail (App Password)");
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
        console.error("TROUBLESHOOTING:");
        console.error("1. Verify GOOGLE_USER is set in .env file");
        console.error("2. Verify GMAIL_APP_PASSWORD is set (or OAuth2 credentials)");
        console.error("3. For Gmail: Generate App Password at https://myaccount.google.com/apppasswords");
        console.error("4. Ensure 2-Factor Authentication is enabled on Gmail account");
    });

export async function sendEmail({ to, subject, html, text }) {
    try {
        if (!process.env.GOOGLE_USER) {
            console.error("❌ EMAIL NOT CONFIGURED: GOOGLE_USER is missing");
            console.error("Required: Set GOOGLE_USER and GMAIL_APP_PASSWORD in .env file");
            throw new Error("Email service not configured. Set GOOGLE_USER and GMAIL_APP_PASSWORD in .env");
        }

        if (!process.env.GMAIL_APP_PASSWORD && !process.env.GOOGLE_REFRESH_TOKEN) {
            console.error("❌ EMAIL CREDENTIALS MISSING");
            console.error("Set either: GMAIL_APP_PASSWORD (for basic auth) or OAuth2 credentials (GOOGLE_REFRESH_TOKEN)");
            throw new Error("Email credentials missing. Configure GMAIL_APP_PASSWORD or OAuth2 credentials in .env");
        }

        console.log(`📧 Preparing email for: ${to}`);
        console.log(`📧 Subject: ${subject}`);
        console.log(`📧 From: ${process.env.GOOGLE_USER}`);

        const mailOptions = {
            from: `"Perplexity" <${process.env.GOOGLE_USER}>`,
            to,
            subject,
            html,
            text
        };

        console.log("📧 Sending email via nodemailer...");
        const details = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${to}`);
        console.log(`📧 Message ID: ${details.messageId}`);
        return details;
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error.message);
        console.error("Full error:", error);
        throw error;
    }
}