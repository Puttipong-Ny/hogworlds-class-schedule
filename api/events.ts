import { MongoClient, ObjectId } from "mongodb";
import type { IncomingMessage, ServerResponse } from "http";
import { parse } from "url";

let client: MongoClient;

async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI!);
    await client.connect();
  }
  return client.db("ravenclaw").collection("events");
}

function getRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(
  req: IncomingMessage & { method?: string; body?: any },
  res: ServerResponse & {
    status: (code: number) => any;
    json: (data: any) => void;
  }
) {
  const events = await connectDB();
  const { query } = parse(req.url || "", true); // 👈 ดึง query param
  const year = query.year as string; // ถ้าไม่ส่งมาก็ default = year1

  if (req.method === "GET") {
    const { query } = parse(req.url || "", true);
    const year = query.year as string;
    const data = await events.find({ year }).sort({ date: 1 }).toArray();
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { subject, start, end, date, location, professor } = body; 

    const year = body.year || query.year;

    const result = await events.insertOne({
      subject,
      start,
      end,
      date,
      year,
      professor,
      location, 
    });

    return res.status(200).json(result);
  }

  if (req.method === "DELETE") {
    try {
      const body = await getRequestBody(req);
      const { id } = body;

      if (!id) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Missing id" }));
        return;
      }

      const col = await connectDB();
      const result = await col.deleteOne({ _id: new ObjectId(id) });

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true, deleted: result.deletedCount }));
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Delete failed" }));
    }
    return;
  }
  return res.status(405).json({ error: "Method not allowed" });
}
