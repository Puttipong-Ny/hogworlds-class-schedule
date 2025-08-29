import { MongoClient, ObjectId } from "mongodb";
import type { IncomingMessage, ServerResponse } from "http";

let client: MongoClient;

async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI!);
    await client.connect();
  }
  return client.db("ravenclaw").collection("subjects");
}

export default async function handler(
  req: IncomingMessage & { method?: string; body?: any },
  res: ServerResponse & {
    status: (code: number) => any;
    json: (data: any) => void;
  }
) {
  const subjects = await connectDB();

  if (req.method === "GET") {
    const data = await subjects.find().sort({ name: 1 }).toArray();
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, color, icon } = body;

    if (!name || !color || !icon) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ ตรวจสอบว่า color เป็น string
    if (typeof color !== "string" || !color.startsWith("#")) {
      return res.status(400).json({ error: "Color must be hex string" });
    }

    const result = await subjects.insertOne({
      name,
      color, // ✅ hex เช่น "#ffcc00"
      icon,
      createdAt: new Date(),
    });
    return res.status(200).json(result);
  }

  if (req.method === "DELETE") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (body.id) {
      const subject = await subjects.findOne({ _id: new ObjectId(body.id) });
      if (!subject) {
        return res.status(404).json({ error: "Subject not found" });
      }

      // ✅ ลบรายวิชา
      const result = await subjects.deleteOne({ _id: new ObjectId(body.id) });

      // ✅ ลบตารางเรียน (events) ที่ใช้รายวิชานี้
      const eventsCol = client.db("ravenclaw").collection("events");
      await eventsCol.deleteMany({ subject: subject.name });

      return res.status(200).json(result);
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
