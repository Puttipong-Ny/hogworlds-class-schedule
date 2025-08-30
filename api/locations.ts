import { MongoClient, ObjectId } from "mongodb";
import type { IncomingMessage, ServerResponse } from "http";

let client: MongoClient;

async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI!);
    await client.connect();
  }
  return client.db("ravenclaw").collection("locations");
}

export default async function handler(
  req: IncomingMessage & { method?: string; body?: any },
  res: ServerResponse & {
    status: (code: number) => any;
    json: (data: any) => void;
  }
) {
  const locations = await connectDB();

  if (req.method === "GET") {
    const data = await locations.find().sort({ name: 1 }).toArray();
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, floor, type } = body;

    if (!name || !floor || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await locations.insertOne({
      name,
      floor,
      type,
      createdAt: new Date(),
    });
    return res.status(200).json(result);
  }

  if (req.method === "PUT") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { id, name, floor, type } = body;

    if (!id) return res.status(400).json({ error: "Missing id" });

    const result = await locations.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...(name && { name }),
          ...(floor && { floor }),
          ...(type && { type }),
          updatedAt: new Date(),
        },
      }
    );
    return res.status(200).json(result);
  }

  if (req.method === "DELETE") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!body.id) return res.status(400).json({ error: "Missing id" });

    const result = await locations.deleteOne({ _id: new ObjectId(body.id) });
    return res.status(200).json(result);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
