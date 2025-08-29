import { VercelRequest, VercelResponse } from "@vercel/node"
import { MongoClient } from "mongodb"
import subjects from "../../data/subjects.json" assert { type: "json" }

let client: MongoClient

async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI!)
    await client.connect()
  }
  return client.db("ravenclaw").collection("subjects")
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const col = await connectDB()
    await col.deleteMany({})
    const result = await col.insertMany(subjects)
    res.status(200).json({ ok: true, inserted: result.insertedCount })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Insert failed" })
  }
}
