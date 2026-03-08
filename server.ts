import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/perplexity", async (req, res) => {
    try {
      const { messages } = req.body;
      const apiKey = process.env.PERPLEXITY_API_KEY;
      
      if (!apiKey) {
        return res.status(400).json({ error: "PERPLEXITY_API_KEY is not set. Please configure it in your environment variables." });
      }

      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: messages
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Perplexity API error:", errorData);
        return res.status(response.status).json({ error: "Failed to fetch from Perplexity API" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error calling Perplexity:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built Vite assets
    app.use(express.static("dist"));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile("index.html", { root: "dist" });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
