import React, { useEffect, useState } from "react";
import { Card, Button, Spin } from "antd";
import dayjs from "dayjs";
import * as AntdIcons from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LoadingPage from "../components/Layout/LoadingPage";

type EventItem = {
  _id?: string;
  subject: string;
  start: string;
  end: string;
  date: string;
  year: string;
  location?: string;
  professor?: string;
};

type SubjectItem = {
  _id: string;
  name: string;
  color: string;
  icon: string;
};

// ✅ util cookie
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}
function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

const Dashboard: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainYear, setMainYear] = useState<string>("1"); // ✅ เก็บปีหลัก
  const navigate = useNavigate();

  useEffect(() => {
    // โหลดปีหลักจาก cookie
    const saved = getCookie("mainYear") || "1";
    setMainYear(saved);

    const fetchData = async () => {
      setLoading(true);
      try {
        const yearParam = mainYear.startsWith("year")
          ? mainYear
          : `year${mainYear}`;

        const [resEvents, resSubjects] = await Promise.all([
          fetch(`/api/events?year=${yearParam}`),
          fetch(`/api/subjects`),
        ]);

        setEvents(await resEvents.json());
        setSubjects(await resSubjects.json());
      } catch (err) {
        console.error("โหลดข้อมูลไม่สำเร็จ:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mainYear]); // ✅ reload เมื่อเปลี่ยนปีหลัก

  if (loading) {
    return <LoadingPage />;
  }

  const today = dayjs().format("YYYY-MM-DD");
  const eventsToday = events.filter((e) => e.date === today);
  const uniqueSubjectsToday = Array.from(
    new Set(eventsToday.map((e) => e.subject))
  );

  const getSubjectInfo = (name: string) =>
    subjects.find((s) => s.name === name);

  // ✅ handle กดเปลี่ยนปีหลัก
  const handleYearChange = (year: string) => {
    setMainYear(year);
    setCookie("mainYear", year, 30); // เก็บ cookie 30 วัน
  };

  // 📌 handle กดปุ่ม "ดูตารางเรียนทั้งหมด"
  const handleViewAll = () => {
    const yearParam = mainYear.startsWith("year")
      ? mainYear
      : `year${mainYear}`;
    navigate(
      `/${yearParam}/schedule?tab=week2&date=${dayjs().format("YYYY-MM-DD")}`
    );
  };

  return (
    <div className="p-6 bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">ภาพรวมตารางเรียนและกิจกรรมของคุณ</p>
        </div>

        {/* ✅ ปุ่มเลือกปีหลัก */}
        <div className="flex gap-2">
          {["1", "2", "3", "4", "5", "6", "7"].map((y) => (
            <Button
              key={y}
              type={mainYear === y ? "primary" : "default"}
              onClick={() => handleYearChange(y)}
            >
              ปี {y}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <Spin />
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-xl shadow">
              <p className="text-gray-500">วิชาที่เรียนวันนี้</p>
              <p className="text-2xl font-bold">
                {uniqueSubjectsToday.length} วิชา
              </p>
              <span className="text-sm text-gray-400">
                นับเฉพาะชื่อวิชา ไม่ซ้ำกัน
              </span>
            </Card>
            <Card className="rounded-xl shadow">
              <p className="text-gray-500">จำนวนคาบเรียนวันนี้ (รวมซ้ำ)</p>
              <p className="text-2xl font-bold text-blue-600">
                {eventsToday.length} คาบ
              </p>
              <span className="text-sm text-gray-400">
                รวมวิชาที่มีในวัน {dayjs().format("DD/MM/YYYY")}
              </span>
            </Card>
          </div>

          {/* ตารางเรียนวันนี้ */}
          <div>
            <Card
              title="ตารางเรียนวันนี้"
              className="rounded-xl shadow"
              extra={
                <span className="text-gray-400">
                  {dayjs().format("dddd DD MMMM YYYY")}
                </span>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventsToday.length === 0 ? (
                  <p className="text-gray-400 text-center col-span-2">
                    ไม่มีตารางเรียนวันนี้
                  </p>
                ) : (
                  eventsToday.map((ev, i) => {
                    const info = getSubjectInfo(ev.subject);
                    const IconComp = info
                      ? (AntdIcons as any)[info.icon]
                      : null;

                    return (
                      <div
                        key={ev._id || i}
                        className="flex justify-between items-center p-3 border rounded-lg shadow-sm"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            {IconComp && (
                              <IconComp
                                style={{ color: info?.color, fontSize: 20 }}
                              />
                            )}
                            <p className="text-lg font-bold">{ev.subject}</p>
                          </div>

                          {/* ศาสตราจารย์ */}
                          {ev.professor && (
                            <p className="text-base font-medium text-gray-700 mt-1">
                              👨‍🏫 Prof.{ev.professor}
                            </p>
                          )}

                          {/* สถานที่ */}
                          {ev.location && (
                            <p className="text-sm text-gray-600 mt-1">
                              📍 {ev.location}
                            </p>
                          )}
                        </div>

                        {/* เวลา */}
                        <span
                          className="px-4 py-2 rounded-lg text-base font-semibold"
                          style={{
                            backgroundColor: info?.color
                              ? info.color + "20"
                              : "#f0f0f0",
                            color: info?.color || "#555",
                          }}
                        >
                          {ev.start}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 text-center">
                <Button type="default" onClick={handleViewAll}>
                  ดูตารางเรียนทั้งหมด
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
