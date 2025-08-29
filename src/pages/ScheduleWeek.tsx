import React, { useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import { useSearchParams } from "react-router-dom";
import { Tooltip } from "antd";
import * as AntdIcons from "@ant-design/icons";

import {
  BookOutlined,
  ExperimentOutlined,
  RocketOutlined,
  BugOutlined,
  StarOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";

type EventItem = {
  _id?: string;
  subject: string;
  start: string;
  end: string;
  date: string;
};

const days = [
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
  "อาทิตย์",
];

// 20:00 ถึง 01:00 (step 30 นาที)
const hours = Array.from({ length: 13 }, (_, i) => {
  const totalMinutes = 19 * 60 + i * 30;
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
});

// 🎨 สีแตกต่างอัตโนมัติ
const colors = [
  "#f87171",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#a78bfa",
  "#fb923c",
  "#14b8a6",
];
const getColorForSubject = (subject: string) => {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// 🎯 map subject → icon
const getIconForSubject = (subject: string) => {
  if (subject.includes("คาถา")) return <BookOutlined />;
  if (subject.includes("แปรธาตุ")) return <ExperimentOutlined />;
  if (subject.includes("การบิน")) return <RocketOutlined />;
  if (subject.includes("สัตว์")) return <BugOutlined />;
  if (subject.includes("ดาราศาสตร์")) return <StarOutlined />;
  if (subject.includes("สมุนไพร") || subject.includes("ยา"))
    return <MedicineBoxOutlined />;
  return <BookOutlined />;
};

// 🛠 จัด row ของ event (กันทับเวลา)
function assignRows(events: EventItem[]): EventItem[][] {
  const rows: EventItem[][] = [];
  const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start));

  sorted.forEach((ev) => {
    let placed = false;
    for (const row of rows) {
      const conflict = row.some(
        (r) => !(ev.end <= r.start || ev.start >= r.end)
      );
      if (!conflict) {
        row.push(ev);
        placed = true;
        break;
      }
    }
    if (!placed) rows.push([ev]);
  });
  return rows;
}

// ⏰ หาช่วงเวลาตาม hours จริง ๆ
const parseTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const startMinutes = parseTime("19:00"); // 19:00 = 1140
let endMinutes = parseTime("01:00"); // 01:00 = 60
if (endMinutes < startMinutes) endMinutes += 24 * 60; // ข้ามวันใหม่
const totalMinutesRange = endMinutes - startMinutes; // 360 นาที

const slotCount = hours.length; // 13 ช่อง (19:00 - 01:00)

const getLeftPx = (time: string, slotWidth: number) => {
  let minutes = parseTime(time);
  if (minutes < startMinutes) minutes += 24 * 60;
  const diff = minutes - startMinutes;
  return (diff / 30) * slotWidth; // 30 นาทีต่อ 1 ช่อง
};

const getWidthPx = (start: string, end: string, slotWidth: number) => {
  let startM = parseTime(start);
  let endM = parseTime(end);
  if (endM < startM) endM += 24 * 60;
  if (startM < startMinutes) startM += 24 * 60;
  const diff = endM - startM;
  return (diff / 30) * slotWidth; // กี่ช่อง × ความกว้างต่อช่อง
};

const ScheduleWeek: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const [current] = useState<Dayjs>(dateParam ? dayjs(dateParam) : dayjs());
  const containerRef = useRef<HTMLDivElement>(null);
  const [slotWidth, setSlotWidth] = useState(0);

  function getIcon(iconName: string, color: string) {
    const IconComponent = (AntdIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent style={{ color, fontSize: 14 }} />;
  }

  useEffect(() => {
    if (containerRef.current) {
      setSlotWidth(containerRef.current.offsetWidth / slotCount);
    }
    const handleResize = () => {
      if (containerRef.current) {
        setSlotWidth(containerRef.current.offsetWidth / slotCount);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [evRes, subRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/subjects"),
      ]);

      const evData = await evRes.json();
      const subData = await subRes.json();

      setEvents(evData);
      setSubjects(subData);

      console.log("subRes ", subData); // ✅ ใช้ค่าจริงที่เพิ่ง fetch
    };
    fetchData();
  }, []);

  // สัปดาห์ปัจจุบัน (จันทร์ - อาทิตย์)
  const weekStart = current.startOf("week").add(1, "day");
  const weekEnd = weekStart.add(6, "day");

  const rowHeight = 32;

  return (
    <div
      className="p-6 bg-white rounded-xl shadow-lg"
      style={{ width: "1600px" }}
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        👥 ปฏิทินรายสัปดาห์ ({weekStart.format("DD/MM/YYYY")} –{" "}
        {weekEnd.format("DD/MM/YYYY")})
      </h2>

      {/* Header เวลา */}
      <div className="grid grid-cols-[150px_1fr] border-b">
        <div></div>
        <div className="flex flex-1">
          {hours.map((time) => (
            <div
              key={time}
              className="flex-1 text-center text-sm text-gray-600 border-l"
            >
              {time}
            </div>
          ))}
        </div>
      </div>

      {/* ตารางวัน */}
      {days.map((day, idx) => {
        const dayDate = weekStart.add(idx, "day");
        const dayEvents = events.filter((ev) =>
          dayjs(ev.date).isSame(dayDate, "day")
        );
        const rows = assignRows(dayEvents);
        const height = Math.max(60, rows.length * rowHeight + 8);

        return (
          <div
            key={day}
            className="grid grid-cols-[150px_1fr] border-b relative"
            style={{ height: `${height}px` }}
          >
            {/* คอลัมน์ชื่อวัน */}
            <div className="flex items-start justify-center bg-gray-50 font-medium pt-2">
              {day}
            </div>

            {/* เส้น timeline */}
            <div className="relative flex-1 border-l" ref={containerRef}>
              {/* เส้นเวลา */}
              <div className="absolute inset-0 flex">
                {hours.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 border-l border-gray-200"
                  ></div>
                ))}
              </div>

              {/* Event */}
              {rows.map((row, rowIndex) =>
                row.map((ev) => {
                  const subject = subjects.find((s) => s.name === ev.subject);
                  const color = subject?.color || "#888";
                  const iconName = subject?.icon || "BookOutlined";

                  return (
                    <Tooltip
                      key={ev._id}
                      title={`${subject?.name || ev.subject} (${ev.start} - ${
                        ev.end
                      })`}
                    >
                      <div
                        className="absolute h-7 flex items-center gap-2 px-3 text-xs font-semibold text-white rounded-lg shadow-md"
                        style={{
                          top: rowIndex * rowHeight + 4,
                          left: getLeftPx(ev.start, slotWidth),
                          width: getWidthPx(ev.start, ev.end, slotWidth),
                          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                        }}
                      >
                        {getIcon(iconName, "white")}
                        <span className="truncate text-center w-full">
                          {subject?.name || ev.subject} ({ev.start}-{ev.end})
                        </span>
                      </div>
                    </Tooltip>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleWeek;
