import React from "react";
import { Tabs } from "antd";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";

import ScheduleMonth from "./ScheduleMonth";
import ScheduleWeek from "./ScheduleWeek";
import ScheduleWeek2 from "./ScheduleWeek2";

const { TabPane } = Tabs;

const SchedulePage: React.FC = () => {
  const { year } = useParams<{ year: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ อ่าน query param
  const activeTab = searchParams.get("tab") || "month";
  const date = searchParams.get("date") || dayjs().format("YYYY-MM-DD");

  // ✅ เวลาเปลี่ยน tab ให้ sync URL
  const handleTabChange = (key: string) => {
    navigate(`/${year}/schedule?tab=${key}&date=${date}`);
  };

  return (
    <div
      className="p-6 bg-white rounded-xl shadow-lg"
      style={{ width: "1600px" }}
    >
      <Tabs
        defaultActiveKey="month"
        items={[
          {
            key: "month",
            label: "รายเดือน",
            children: <ScheduleMonth />,
          },
          {
            key: "week",
            label: "รายสัปดาห์",
            children: <ScheduleWeek />,
          },
          {
            key: "week2",
            label: "รายสัปดาห์ (แบบ 2)",
            children: <ScheduleWeek2 />,
          },
        ]}
      />
    </div>
  );
};

export default SchedulePage;
