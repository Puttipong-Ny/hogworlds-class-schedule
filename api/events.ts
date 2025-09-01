import { MongoClient, ObjectId } from "mongodb";
import type { IncomingMessage, ServerResponse } from "http";
import { parse } from "url";

let client: MongoClient;

async function connectDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI!);
    await client.connect();
  }
  return client.db("slytherin").collection("events");
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

  if (req.method === "PUT") {
    try {
      const body = await getRequestBody(req);

      // ✅ ถ้ามี _id → update event เดี่ยว
      if (body._id) {
        const { _id, subject, start, end, date, year, professor, location } =
          body;
        const col = await connectDB();
        const result = await col.updateOne(
          { _id: new ObjectId(_id) },
          { $set: { subject, start, end, date, year, professor, location } }
        );

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, modified: result.modifiedCount }));
        return;
      }

      // ✅ ถ้าไม่มี _id → ทำงานแบบ copy สัปดาห์
      const { weekStart, weekEnd, year } = body;
      if (!weekStart || !weekEnd || !year) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Missing params" }));
        return;
      }

      const col = await connectDB();
      const eventsThisWeek = await col
        .find({ year, date: { $gte: weekStart, $lte: weekEnd } })
        .toArray();

      if (eventsThisWeek.length === 0) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, copied: 0 }));
        return;
      }

      const nextEvents = eventsThisWeek.map((ev) => {
        const d = new Date(ev.date);
        d.setDate(d.getDate() + 7);
        return {
          subject: ev.subject,
          start: ev.start,
          end: ev.end,
          date: d.toISOString().slice(0, 10),
          year: ev.year,
          professor: ev.professor,
          location: ev.location,
        };
      });

      const result = await col.insertMany(nextEvents);

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: true, copied: result.insertedCount }));
      return;
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Update/Copy failed" }));
    }
  }

  if (req.method === "DELETE") {
    try {
      const body = await getRequestBody(req);
      const { id, weekStart, weekEnd, year } = body;
      const col = await connectDB();

      // ✅ กรณีลบ event เดี่ยว
      if (id) {
        const result = await col.deleteOne({ _id: new ObjectId(id) });
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, deleted: result.deletedCount }));
        return;
      }

      // ✅ กรณีลบทั้งสัปดาห์
      if (weekStart && weekEnd && year) {
        const result = await col.deleteMany({
          year,
          date: { $gte: weekStart, $lte: weekEnd },
        });
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, deleted: result.deletedCount }));
        return;
      }

      // ❌ ถ้าไม่ส่ง params ที่ถูกต้อง
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Missing id or week range" }));
      return;
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Delete failed" }));
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
