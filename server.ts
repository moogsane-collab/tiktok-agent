import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock Scraper Endpoint
  // In a real app, this would call a service like Apify or use Puppeteer
  app.post("/api/scrape", (req, res) => {
    const { keyword, period, count } = req.body;
    
    // Simulate scraping delay
    setTimeout(() => {
      const mockVideos = generateMockVideos(keyword, count || 6);
      res.json({ videos: mockVideos });
    }, 1500);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

function generateMockVideos(keyword: string, count: number) {
  const hooks = [
    `La VERDAD que nadie te dice sobre ${keyword}`,
    `Deja de ser DÉBIL. ${keyword} real.`,
    `¿Por qué fracasas en ${keyword}? Esto es lo que pasa.`,
    `El método que usé para transformar mi ${keyword} en 30 días`,
    `Si haces ESTO pierdes toda tu energía masculina`,
    `${keyword}: Lo que los hombres fuertes hacen diferente`,
    `PARA. Lee esto antes de rendirte en ${keyword}`,
    `3 errores que destruyen tu progreso en ${keyword}`,
  ];

  const accounts = [
    "@disciplina_brutal", "@mente_de_acero", "@hombre_estoico",
    "@codigo_alfa", "@warrior_mindset_es", "@legionmental"
  ];

  return Array.from({ length: count }).map((_, i) => {
    const views = Math.floor(Math.random() * 900000) + 10000;
    const likes = Math.floor(views * 0.05);
    return {
      id: `tt_${Date.now()}_${i}`,
      hook: hooks[i % hooks.length],
      account: accounts[Math.floor(Math.random() * accounts.length)],
      views,
      likes,
      shares: Math.floor(likes * 0.2),
      comments: Math.floor(likes * 0.1),
      engagement: (Math.random() * 10 + 2).toFixed(1),
      duration: Math.floor(Math.random() * 45 + 15),
      thumbnail: `https://picsum.photos/seed/${i + Date.now()}/400/600`,
      visualDescription: [
        "Hombre en el gimnasio con iluminación dramática",
        "Texto blanco grande sobre fondo negro",
        "Primer plano de cara seria con sombras",
        "Clips rápidos de entrenamiento intenso",
        "Ambiente oscuro y minimalista"
      ][i % 5],
      comments_data: [
        { text: "Esto es exactamente lo que necesitaba hoy 🔥", sentiment: "positive" },
        { text: "¿Cómo puedo empezar hoy mismo?", sentiment: "neutral", isQuestion: true },
        { text: "Brutal. Sin filtros.", sentiment: "positive" }
      ]
    };
  });
}

startServer();
