import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from "resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialization of Resend to prevent startup crashes
let resendClient: Resend | null = null;
const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("re_...")) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;
    const resend = getResend();

    console.log("------------------------------------------");
    console.log("NEW CONTACT FORM SUBMISSION");
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log("------------------------------------------");

    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: "Portfolio <onboarding@resend.dev>",
          to: ["hardik9462@gmail.com"],
          subject: `Portfolio: ${subject}`,
          html: `
            <h3>New Inquiry from your Portfolio</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        });

        if (error) {
          console.error("Resend delivery error:", error);
          return res.status(500).json({ success: false, message: "Email delivery failed." });
        }
        
        return res.status(200).json({ 
          success: true, 
          message: "Inquiry successfully dispatched to your inbox!" 
        });
      } catch (err) {
        console.error("Server error during email sending:", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
      }
    }

    // Fallback if Resend is not configured correctly
    res.status(200).json({ 
      success: true, 
      message: "Thank you! Inquiry received (Note: Email service not configured, showing in server logs)." 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
