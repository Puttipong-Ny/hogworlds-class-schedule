import type { IncomingMessage, ServerResponse } from "http";
import { MongoClient } from "mongodb";
import subjects from "../../data/subjects.json" assert { type: "json" };

let client: MongoClient;

async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI!);
    await client.connect();
  }
  return client.db("slytherin").collection("subjects");
}

export default async function handler(
  req: IncomingMessage & { method?: string },
  res: ServerResponse
) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  try {
    const col = await connectDB();
    await col.deleteMany({});
    const result = await col.insertMany(subjects);

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true, inserted: result.insertedCount }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Insert failed" }));
  }
}
