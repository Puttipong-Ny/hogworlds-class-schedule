import { MongoClient, ObjectId } from "mongodb";
import type { IncomingMessage, ServerResponse } from "http";

let client: MongoClient;

async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI!);
    await client.connect();
  }
  return client.db("ravenclaw").collection("events");
}

export default async function handler(
  req: IncomingMessage & { method?: string; body?: any },
  res: ServerResponse & {
    status: (code: number) => any;
    json: (data: any) => void;
  }
) {
  const events = await connectDB();

  if (req.method === "GET") {
    const data = await events.find().sort({ date: 1 }).toArray();
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { subject, start, end, date } = body;
    const result = await events.insertOne({ subject, start, end, date });
    return res.status(200).json(result);
  }

  if (req.method === "DELETE") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (body.id) {
      // ลบเฉพาะตัวเดียว
      const result = await events.deleteOne({ _id: new ObjectId(body.id) });
      return res.status(200).json(result);
    }
    if (body.date) {
      // ลบทั้งวัน
      const result = await events.deleteMany({ date: body.date });
      return res.status(200).json(result);
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
