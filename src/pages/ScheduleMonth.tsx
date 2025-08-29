import React, { useEffect, useState } from "react";
import {
  Calendar,
  Modal,
  Form,
  Select,
  TimePicker,
  Dropdown,
  MenuProps,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/th";
import locale from "antd/es/date-picker/locale/th_TH";
import { useNavigate } from "react-router-dom";
import * as AntdIcons from "@ant-design/icons";

type EventItem = {
  _id?: string;
  subject: string; // ตอนนี้ยังเก็บเป็นชื่อ ถ้าจะปรับเป็น subjectId ได้
  start: string;
  end: string;
  date?: string;
};

type SubjectItem = {
  _id: string;
  name: string;
  color: string;
  icon: string;
  createdAt?: string;
};

const menuItems: MenuProps["items"] = [
  { key: "select", label: "เลือก" },
  { key: "add", label: "เพิ่ม" },
  { key: "delete", label: "ลบ" },
];

function parseColor(color: any): string {
  if (!color) return "#888";

  // ถ้าเก็บเป็น string อยู่แล้ว
  if (typeof color === "string") return color;

  // ถ้ามี metaColor (จาก Antd ColorPicker)
  if (color.metaColor) {
    const { r, g, b, a } = color.metaColor;
    return `rgba(${r}, ${g}, ${b}, ${a ?? 1})`;
  }

  // ถ้ามี r,g,b,a ตรง ๆ
  if ("r" in color && "g" in color && "b" in color) {
    const { r, g, b, a } = color;
    return `rgba(${r}, ${g}, ${b}, ${a ?? 1})`;
  }

  return "#888";
}

// 🛠 ฟังก์ชันหา icon จากชื่อ
function getIcon(iconName: string, color: string) {
  const IconComponent = (AntdIcons as any)[iconName];
  if (!IconComponent) return null;
  return <IconComponent style={{ color, fontSize: 14 }} />;
}

const ScheduleMonth: React.FC = () => {
  const navigate = useNavigate();

  //region state
  const [value, setValue] = useState<Dayjs>(dayjs());
  const [events, setEvents] = useState<Record<string, EventItem[]>>({});
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteList, setDeleteList] = useState<EventItem[]>([]);
  //endregion

  // โหลด events + subjects
  useEffect(() => {
    const fetchData = async () => {
      const [evRes, subRes] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/subjects"),
      ]);

      const evData = await evRes.json();
      const subData = await subRes.json();

      const grouped = evData.reduce((acc: any, ev: any) => {
        const key = dayjs(ev.date).format("YYYY-MM-DD");
        acc[key] = [...(acc[key] || []), ev];
        return acc;
      }, {});

      setEvents(grouped);
      setSubjects(subData);
    };
    fetchData();
  }, []);

  // ✅ render events ของแต่ละวัน
  const cellRender = (date: Dayjs, info: { type: string }) => {
    if (info.type === "date") {
      const key = date.format("YYYY-MM-DD");
      const listData = events[key] || [];

      return (
        <Dropdown
          menu={{
            items: menuItems,
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              handleAction(key, date);
            },
          }}
          trigger={["contextMenu"]}
        >
          <div className="h-full w-full p-1">
            <ul className="space-y-1">
              {listData.map((item, index) => {
                const subject = subjects.find((s) => s.name === item.subject);
                const color = parseColor(subject?.color);
                const iconName = subject?.icon || "BookOutlined";
                const name = subject?.name || item.subject;

                return (
                  <li key={index}>
                    <div
                      className="flex items-center gap-2 px-2 py-1 rounded text-xs font-semibold text-white shadow-sm"
                      style={{
                        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                      }}
                    >
                      {getIcon(iconName, "white")}
                      <span className="truncate">
                        {name} ({item.start}-{item.end})
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Dropdown>
      );
    }
    return null;
  };

  // ✅ เปิด modal ตอนกดเลือกวัน
  const handleSelect = (date: Dayjs, info: { source: string }) => {
    if (info.source === "date" && !isActionOpen && !isAddOpen) {
      navigate(`/schedule-week?date=${date.format("YYYY-MM-DD")}`);
    }
  };

  // ✅ กดบันทึก
  const handleOk = async () => {
    try {
      if (!selectedDate) {
        Modal.warning({
          title: "กรุณาเลือกวันที่ก่อน",
          content: "คุณต้องเลือกวันจากปฏิทินก่อนถึงจะเพิ่มตารางเรียนได้",
        });
        return;
      }

      const values = await form.validateFields();

      const newEvent: EventItem = {
        subject: values.subject, // ตอนนี้เก็บ name (ถ้าอยากเก็บ _id แก้ตรงนี้)
        start: values.time[0].format("HH:mm"),
        end: values.time[1].format("HH:mm"),
      };

      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEvent,
          date: selectedDate.startOf("day").format("YYYY-MM-DD"),
        }),
      });

      const res = await fetch("/api/events");
      const data = await res.json();
      const grouped = data.reduce((acc: any, ev: any) => {
        const key = dayjs(ev.date).format("YYYY-MM-DD");
        acc[key] = [...(acc[key] || []), ev];
        return acc;
      }, {});

      setEvents(grouped);
      setIsAddOpen(false);
      form.resetFields();
      setSelectedDate(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = (action: string, date: Dayjs) => {
    setSelectedDate(date);

    if (action === "add") {
      setIsAddOpen(true);
    }

    if (action === "delete") {
      const key = date.format("YYYY-MM-DD");
      setDeleteList(events[key] || []);
      setIsDeleteOpen(true);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        📅 ปฏิทินการเรียน
      </h2>
      <Calendar
        value={value}
        onSelect={handleSelect}
        onPanelChange={(newValue) => setValue(newValue)}
        cellRender={cellRender}
        locale={locale}
        fullscreen={true}
        className="rounded-lg border shadow-sm"
      />

      {/* Modal เพิ่ม */}
      <Modal
        title={`เพิ่มตารางเรียน (${selectedDate?.format("DD/MM/YYYY")})`}
        open={isAddOpen}
        onOk={handleOk}
        onCancel={() => setIsAddOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="subject"
            label="วิชา"
            rules={[{ required: true, message: "กรุณาเลือกวิชา" }]}
          >
            <Select placeholder="เลือกวิชา">
              {subjects.map((s) => (
                <Select.Option key={s._id} value={s.name}>
                  {getIcon(s.icon, s.color)} {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="time"
            label="เวลาเรียน"
            rules={[{ required: true, message: "กรุณาเลือกเวลา" }]}
          >
            <TimePicker.RangePicker format="HH:mm" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal ลบ */}
      <Modal
        title={`ลบตารางเรียน (${selectedDate?.format("DD/MM/YYYY")})`}
        open={isDeleteOpen}
        onCancel={() => setIsDeleteOpen(false)}
        footer={null}
      >
        <ul className="space-y-2">
          {deleteList.map((item: any) => {
            const subject = subjects.find((s) => s.name === item.subject);
            return (
              <li key={item._id} className="flex justify-between items-center">
                <span>
                  {subject?.name || item.subject} ({item.start}-{item.end})
                </span>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={async () => {
                    await fetch("/api/events", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: item._id }),
                    });
                    const res = await fetch("/api/events");
                    const data = await res.json();
                    const grouped = data.reduce((acc: any, ev: any) => {
                      const key = dayjs(ev.date).format("YYYY-MM-DD");
                      acc[key] = [...(acc[key] || []), ev];
                      return acc;
                    }, {});
                    setEvents(grouped);
                    setDeleteList(
                      grouped[selectedDate?.format("YYYY-MM-DD") || ""] || []
                    );
                  }}
                >
                  ลบ
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </div>
  );
};

export default ScheduleMonth;
