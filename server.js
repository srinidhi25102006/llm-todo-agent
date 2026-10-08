import express from "express";
import * as store from "./taskStore.js";
import { runAgent } from "./agent.js";

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/api/tasks", (req, res) => {
  res.json(store.listTasks());
});

app.post("/api/tasks", (req, res) => {
  const { title, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });
  const task = store.createTask(title, dueDate);
  res.status(201).json(task);
});

app.patch("/api/tasks/:id/complete", (req, res) => {
  const task = store.completeTask(Number(req.params.id));
  if (!task) return res.status(404).json({ error: "not found" });
  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const deleted = store.deleteTask(Number(req.params.id));
  if (!deleted) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const reply = await runAgent(message);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agent failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});