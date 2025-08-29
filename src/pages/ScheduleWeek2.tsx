import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/th";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useSearchParams, useParams } from "react-router-dom";
import { Tooltip, Spin } from "antd";
import * as AntdIcons from "@ant-design/icons";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type EventItem = {
  _id?: string;
  subject: string;
  start: string;
  end: string;
  date: string;
  year?: string;
};

type SubjectItem = {
  _id?: string;
  name: string;
  color: string;
  icon?: string;
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

const ScheduleWeek2: React.FC = () => {
  const { year } = useParams<{ year: string }>(); // ✅ ดึงปีจาก URL
  const [events, setEvents] = useState<EventItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const [current, setCurrent] = useState<Dayjs>(
    dateParam ? dayjs(dateParam) : dayjs()
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [evRes, subRes] = await Promise.all([
          fetch(`/api/events?year=${year}`), // ✅ filter ตามปี
          fetch(`/api/subjects?year=${year}`),
        ]);
        const evData = await evRes.json();
        const subData = await subRes.json();
        setEvents(evData);
        setSubjects(subData);
      } catch (err) {
        console.error("โหลดข้อมูลล้มเหลว:", err);
      } finally {
        setLoading(false);
      }
    };
    if (year) fetchData();
  }, [year]);

  // สัปดาห์: จันทร์-อาทิตย์
  const weekStart = current.startOf("week").add(1, "day");
  const weekEnd = weekStart.add(6, "day");

  // ดึง event ในช่วงสัปดาห์นี้
  const weekEvents = events.filter(
    (ev) =>
      dayjs(ev.date).isSameOrAfter(weekStart, "day") &&
      dayjs(ev.date).isSameOrBefore(weekEnd, "day")
  );

  // แสดงเฉพาะวิชาที่ "มีคาบในสัปดาห์นี้"
  const subjectsInWeek = new Set(weekEvents.map((ev) => ev.subject));
  const visibleSubjects = subjects.filter((s) => subjectsInWeek.has(s.name));

  // คืน events ของวัน-วิชานั้น ๆ
  const getEventsForCell = (day: string, subjectName: string) => {
    const date = weekStart.add(days.indexOf(day), "day");
    return weekEvents
      .filter(
        (ev) => ev.subject === subjectName && dayjs(ev.date).isSame(date, "day")
      )
      .sort((a, b) => a.start.localeCompare(b.start));
  };

  // ไอคอนจาก DB
  const renderDbIcon = (icon?: string, size = 18, color?: string) => {
    if (!icon) return null;
    const isUrl = icon.startsWith("http") || icon.includes("/");
    if (isUrl) return <img src={icon} alt="" className="h-5 w-5" />;
    const IconComp = (AntdIcons as any)[icon];
    return IconComp ? (
      <IconComp style={{ fontSize: size, color }} />
    ) : (
      <span className="text-xs">{icon}</span>
    );
  };

  // ปุ่มเลื่อนสัปดาห์
  const prevWeek = () => setCurrent((prev) => prev.subtract(1, "week"));
  const nextWeek = () => setCurrent((prev) => prev.add(1, "week"));
  const resetToday = () => setCurrent(dayjs());

  return (
    <Spin spinning={loading}>
      <div
        className="p-6 bg-white rounded-xl shadow-lg"
        style={{ width: "1600px" }}
      >
        {/* Toolbar + หัวข้อ */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prevWeek}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              ◀ สัปดาห์ก่อน
            </button>
            <button
              onClick={nextWeek}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              สัปดาห์ถัดไป ▶
            </button>
            <button
              onClick={resetToday}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              วันนี้
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            👥 ปฏิทินรายสัปดาห์ ({weekStart.format("DD/MM/YYYY")} –{" "}
            {weekEnd.format("DD/MM/YYYY")})
          </h2>
        </div>

        {/* ตาราง */}
        <div className="overflow-x-auto rounded-lg">
          <div className="min-w-max border border-gray-300 rounded-lg">
            {/* Header */}
            <div
              className="grid bg-gray-100"
              style={{
                gridTemplateColumns: `120px repeat(${visibleSubjects.length}, 150px)`,
              }}
            >
              <div className="p-3 text-center font-bold border-r border-gray-300 sticky left-0 top-0 z-20 bg-gray-100">
                วัน / วิชา
              </div>
              {visibleSubjects.map((sub) => (
                <div
                  key={sub._id || sub.name}
                  className="p-2 text-center font-bold border-l border-gray-300 sticky top-0 z-10"
                  style={{
                    background: `linear-gradient(135deg, ${sub.color}, ${sub.color}cc)`,
                  }}
                >
                  <div className="flex flex-col items-center gap-1 text-white drop-shadow">
                    {renderDbIcon(sub.icon, 16, "#fff")}
                    <span className="truncate text-sm">{sub.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Rows */}
            {days.map((day, rowIdx) => (
              <div
                key={day}
                className={`grid border-t border-gray-300 ${
                  rowIdx % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
                style={{
                  gridTemplateColumns: `120px repeat(${visibleSubjects.length}, 150px)`,
                }}
              >
                {/* Day column */}
                <div className="p-3 text-center font-semibold border-r border-gray-300 text-gray-700 sticky left-0 bg-white z-10">
                  {day}
                  <div className="text-xs text-gray-500">
                    {weekStart.add(rowIdx, "day").format("DD/MM")}
                  </div>
                </div>

                {/* Subject cells */}
                {visibleSubjects.map((sub) => {
                  const cellEvents = getEventsForCell(day, sub.name);
                  const hasEvent = cellEvents.length > 0;

                  return (
                    <Tooltip
                      key={sub._id || sub.name}
                      title={
                        hasEvent
                          ? `${sub.name}: ${cellEvents
                              .map((ev) => `${ev.start}-${ev.end}`)
                              .join(", ")}`
                          : "ไม่มีตารางเรียน"
                      }
                      placement="top"
                    >
                      <div className="p-2 border-l border-gray-300">
                        {hasEvent ? (
                          <div className="flex flex-col gap-1">
                            {cellEvents.map((ev) => (
                              <div
                                key={ev._id || `${ev.start}-${ev.end}`}
                                className="px-2 py-1 rounded text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-1"
                                style={{
                                  background: `linear-gradient(90deg, ${sub.color}, ${sub.color}cc)`,
                                }}
                              >
                                {renderDbIcon(sub.icon, 14, "#fff")}
                                <span className="text-center">{ev.start}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default ScheduleWeek2;
