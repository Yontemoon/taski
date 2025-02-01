// server/src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
// import pg from "pg";
import sql from "./db";

// const { Pool } = pg; // Fix the import issue

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Example type for a response
interface ApiResponse {
  message: string;
  timestamp: number;
}

app.get("/api/sup", async (req, res) => {
  console.log("passing");
  try {
    const result = await sql`SELECT * from todos;`;
    console.log(result);
    res.json({ message: "Connected to Supabase", time: result });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.get("/api/test", (_req: Request, res: Response<ApiResponse>) => {
  res.json({
    message: "Express backend is working!",
    timestamp: Date.now(),
  });
});

app.put("/todo/:id", (req, res) => {
  const userId = req.params.id;
  const body = req.body;
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
