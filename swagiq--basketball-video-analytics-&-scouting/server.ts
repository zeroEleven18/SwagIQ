import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Shared Gemini AI client initialized lazily
  let aiClient: GoogleGenAI | null = null;
  function getAI() {
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "HoopVision AI Server" });
  });

  // AI Game Analysis & Tactical Report Endpoint
  app.post("/api/gemini/analyze-game", async (req, res) => {
    try {
      const { gameData, query, mode } = req.body;
      const ai = getAI();

      const systemInstruction = `Sei l'assistente tattico AI e Video Coordinator professionista per Giò, esperto di basketball analytics avanzate ispirate a Roboflow, SAM (Segment Anything Model) e standard NBA/Eurolega.
Fornisci analisi dettagliate in italiano, strutturate e ad alto valore tattico, citando statistiche di squadra (possesso, eFG%, TS%, AST/TO, OREB%), statistiche individuali, letture difensive/offensive (Pick & Roll, Horns, 2-3 Zone, Drop Coverage), e suggerimenti pratici per allenatori e giocatori. Mantieni un tono tecnico, chiaro, appassionato e professionale.`;

      let prompt = "";
      if (mode === "scouting") {
        prompt = `Genera un report di scouting dettagliato e piano tattico per la partita/giocatore basandoti su questi dati:\n${JSON.stringify(gameData, null, 2)}\n\nDomanda specifica o focus: ${query || "Fornisci punti di forza, debolezze, aggiustamenti per il 4° quarto e matchup chiave."}`;
      } else if (mode === "tactics") {
        prompt = `Analizza le tattiche offensive e difensive più frequenti rilevate dal tracciamento video SAM/Roboflow:\n${JSON.stringify(gameData, null, 2)}\n\nRichiesta dell'utente: ${query || "Valuta l'efficienza dei giochi di Pick & Roll e la transizione difensiva."}`;
      } else {
        prompt = `Dati della partita:\n${JSON.stringify(gameData, null, 2)}\n\nDomanda dell'utente:\n${query}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        success: true,
        analysis: response.text,
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Errore durante l'elaborazione con Gemini AI",
      });
    }
  });

  // Interactive Coach Q&A Chat
  app.post("/api/gemini/coach-chat", async (req, res) => {
    try {
      const { messages, gameContext } = req.body;
      const ai = getAI();

      const systemInstruction = `Sei il Virtual Assistant Coach per Giò. Hai accesso ai dati completi del tracciamento video (Roboflow Computer Vision, posizioni di tiro sul campo 2D, box score giocatori, possesso palla, palle perse e palle recuperate).
Rispondi in modo cordiale, competente ed esaustivo in italiano, fornendo schemi, consigli su minutaggio, rotazioni e correzioni tattiche.`;

      const promptContext = `Dati del match corrente:\n${JSON.stringify(gameContext || {}, null, 2)}\n\nCronologia messaggi:\n${JSON.stringify(messages || [], null, 2)}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: promptContext,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        success: true,
        reply: response.text,
      });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Errore nella chat del Coach AI",
      });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HoopVision AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
