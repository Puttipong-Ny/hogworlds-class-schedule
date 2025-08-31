import React, { useEffect, useState } from "react";
import {
  Calendar,
  Modal,
  Form,
  Select,
  TimePicker,
  Dropdown,
  message,
  Spin,
  Space,
} from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/th";
import locale from "antd/es/date-picker/locale/th_TH";
import { useNavigate, useParams } from "react-router-dom";
import * as AntdIcons from "@ant-design/icons";

type EventItem = {
  _id?: string;
  subject: string;
  start: string;
  end: string;
  date: string;
  year?: string;
  location?: string;
  professor?: string;
};

type SubjectItem = {
  _id: string;
  name: string;
  color: string;
  icon: string;
  professors?: string[];
  createdAt?: string;
};

type LocationItem = {
  _id: string;
  name: string;
};

const menuItems = [
  { key: "gotoWeek", label: "เลือก" },
  { key: "add", label: "เพิ่ม" },
  { key: "delete", label: "ลบ" },
];

function parseColor(color: any): string {
  if (!color) return "#888";
  if (typeof color === "string") return color;
  if (color.metaColor) {
    const { r, g, b, a } = color.metaColor;
    return `rgba(${r}, ${g}, ${b}, ${a ?? 1})`;
  }
  if ("r" in color && "g" in color && "b" in color) {
    const { r, g, b, a } = color;
    return `rgba(${r}, ${g}, ${b}, ${a ?? 1})`;
  }
  return "#888";
}

function getIcon(iconName: string, color: string) {
  const IconComponent = (AntdIcons as any)[iconName];
  if (!IconComponent) return null;
  return <IconComponent style={{ color, fontSize: 14 }} />;
}

const LONG_PRESS_MS = 500;

const ScheduleMonth: React.FC = () => {
  const navigate = useNavigate();

  const { year } = useParams<{ year: string }>();

  const [value, setValue] = useState<Dayjs>(dayjs());
  const [events, setEvents] = useState<Record<string, EventItem[]>>({});
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteList, setDeleteList] = useState<EventItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false); // ✅ loading state

  useEffect(() => {
    fetchData();
    fetchLocations();
  }, [year]);

  const fetchData = async () => {
    try {
      setLoading(true); // ✅ ก่อนโหลด
      const [evRes, subRes] = await Promise.all([
        fetch(`/api/events?year=${year}`),
        fetch(`/api/subjects?year=${year}`),
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // ✅ เสร็จแล้ว
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error("โหลดสถานที่ไม่สำเร็จ", err);
    }
  };

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
          trigger={["click", "contextMenu"]} // 👈 ซ้าย/ขวาเหมือนกัน
        >
          <div className="h-full w-full p-1 cursor-pointer">
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
                        {name} ({item.start}) - Prof.{item.professor}
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

  // const handleSelect = (date: Dayjs, info: { source: string }) => {
  //   if (info.source === "date" && !isAddOpen) {
  //     navigate(`/${year}/schedule-week?date=${date.format("YYYY-MM-DD")}`);
  //   }
  // };

  // ✅ กดบันทึก (เพิ่ม)
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
      setLoading(true);

      await Promise.all(
        values.subjects.flatMap((sub: any) =>
          (sub.times || []).map(async (t: { start: Dayjs; end: Dayjs }) => {
            const newEvent: EventItem = {
              subject: sub.subject,
              professor: sub.professor,
              start: t.start.format("HH:mm"),
              end: t.end.format("HH:mm"),
              date: selectedDate!.format("YYYY-MM-DD"),
              year,
              location: sub.location,
            };
            return fetch(`/api/events?year=${year}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newEvent),
            });
          })
        )
      );

      await fetchData();
      message.success("เพิ่มตารางเรียนเรียบร้อย ✅");
      setIsAddOpen(false);
      form.resetFields();
      setSelectedDate(null);
    } catch (err) {
      console.error(err);
      message.error("เพิ่มตารางเรียนล้มเหลว ❌");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ลบพร้อม confirm
  const handleDelete = (item: EventItem) => {
    Modal.confirm({
      title: "ยืนยันการลบ",
      content: `คุณแน่ใจหรือไม่ว่าต้องการลบ "${item.subject}" เวลา ${item.start}?`,
      okText: "ลบ",
      cancelText: "ยกเลิก",
      okButtonProps: { danger: true },
      async onOk() {
        setLoading(true);
        try {
          await fetch("/api/events", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: item._id }),
          });
          await fetchData();

          setDeleteList(events[selectedDate?.format("YYYY-MM-DD") || ""] || []);
          setIsDeleteOpen(false);
          setSelectedDate(null);
          message.success("ลบตารางเรียนเรียบร้อย ✅");
        } catch (err) {
          console.error(err);
          message.error("ลบไม่สำเร็จ ❌");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleAction = (action: string, date: Dayjs) => {
    setSelectedDate(date);

    if (action === "add") setIsAddOpen(true);

    if (action === "delete") {
      const key = date.format("YYYY-MM-DD");
      setDeleteList(events[key] || []);
      setIsDeleteOpen(true);
    }

    if (action === "gotoWeek") {
      navigate(`/${year}/schedule?tab=week&date=${date.format("YYYY-MM-DD")}`);
    }
  };

  const disabledConfig = {
    disabledHours: () => {
      const hours: number[] = [];
      // ปิด 2–17
      for (let h = 2; h < 18; h++) hours.push(h);
      // ปิดชั่วโมง 18 ที่เกินครึ่ง
      return hours;
    },
    disabledMinutes: (selectedHour?: number) => {
      if (selectedHour === 18) {
        return Array.from({ length: 60 }, (_, i) => (i > 30 ? i : null)).filter(
          (v): v is number => v !== null
        );
      }
      return [];
    },
  };

  return (
    <Spin spinning={loading}>
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          📅 ปฏิทินการเรียน
        </h2>
        <Calendar
          value={value}
          // onSelect={handleSelect}
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
          confirmLoading={loading}
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.List name="subjects">
              {(subjectFields, { add: addSubject, remove: removeSubject }) => (
                <>
                  {subjectFields.map(({ key, name, ...restField }) => {
                    // หา subject ที่เลือก
                    const selectedSubjectName = form.getFieldValue([
                      "subjects",
                      name,
                      "subject",
                    ]);
                    const selectedSubject = subjects.find(
                      (s) => s.name === selectedSubjectName
                    );

                    return (
                      <div
                        key={key}
                        className="border p-3 rounded mb-4 bg-gray-50"
                      >
                        {/* เลือกวิชา */}
                        <Form.Item
                          {...restField}
                          name={[name, "subject"]}
                          label="วิชา"
                          rules={[
                            { required: true, message: "กรุณาเลือกวิชา" },
                          ]}
                        >
                          <Select placeholder="เลือกวิชา">
                            {subjects.map((s) => (
                              <Select.Option key={s._id} value={s.name}>
                                {getIcon(s.icon, s.color)} {s.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        {/* ✅ เลือกศาสตราจารย์ */}
                        {
                          <Form.Item
                            noStyle
                            shouldUpdate={(prev, cur) =>
                              prev.subjects?.[name]?.subject !==
                              cur.subjects?.[name]?.subject
                            }
                          >
                            {() => {
                              const selectedSubjectName = form.getFieldValue([
                                "subjects",
                                name,
                                "subject",
                              ]);
                              const selectedSubject = subjects.find(
                                (s) => s.name === selectedSubjectName
                              );

                              return (
                                <Form.Item
                                  {...restField}
                                  name={[name, "professor"]}
                                  label="ศาสตราจารย์"
                                  // rules={[
                                  //   {
                                  //     required: true,
                                  //     message: "กรุณาเลือกศาสตราจารย์",
                                  //   },
                                  // ]}
                                >
                                  <Select
                                    placeholder="เลือกศาสตราจารย์"
                                    disabled={!selectedSubject}
                                  >
                                    {selectedSubject?.professors?.map(
                                      (prof: string) => (
                                        <Select.Option key={prof} value={prof}>
                                          Prof.{prof}
                                        </Select.Option>
                                      )
                                    )}
                                  </Select>
                                </Form.Item>
                              );
                            }}
                          </Form.Item>
                        }

                        {/* เลือกสถานที่ */}
                        <Form.Item
                          {...restField}
                          name={[name, "location"]}
                          label="สถานที่"
                          // rules={[
                          //   { required: true, message: "กรุณาเลือกสถานที่" },
                          // ]}
                        >
                          <Select
                            placeholder="เลือกสถานที่"
                            allowClear
                            showSearch
                          >
                            {locations.map((loc) => (
                              <Select.Option key={loc._id} value={loc.name}>
                                {loc.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        {/* เวลา */}
                        <Form.Item
                          label="เวลา"
                          required
                          rules={[
                            {
                              validator: async (_, value) => {
                                if (
                                  !value ||
                                  value.length === 0 ||
                                  !value[0]?.start
                                ) {
                                  return Promise.reject(
                                    new Error("กรุณาเลือกเวลา")
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <Form.List name={[name, "times"]} initialValue={[{}]}>
                            {(
                              timeFields,
                              { add: addTime, remove: removeTime }
                            ) => (
                              <>
                                {timeFields.map(
                                  ({
                                    key: timeKey,
                                    name: timeName,
                                    ...timeRest
                                  }) => (
                                    <div
                                      key={timeKey}
                                      className="flex items-center gap-2 mb-2"
                                    >
                                      <Form.Item
                                        {...timeRest}
                                        name={[timeName, "start"]}
                                        rules={[
                                          {
                                            required: true,
                                            message: "กรุณาเลือกเวลา",
                                          },
                                        ]}
                                        className="!mb-0 flex-1"
                                        label={false} // 👈 ซ่อน label ของแต่ละแถว
                                      >
                                        <TimePicker
                                          minuteStep={5}
                                          format="HH:mm"
                                          {...disabledConfig}
                                          onChange={(val) => {
                                            if (val) {
                                              const end = val.add(30, "minute");
                                              form.setFieldValue(
                                                [
                                                  "subjects",
                                                  name,
                                                  "times",
                                                  timeName,
                                                ],
                                                { start: val, end }
                                              );
                                            }
                                          }}
                                        />
                                      </Form.Item>

                                      <button
                                        type="button"
                                        className="px-2 py-1 bg-red-500 text-white rounded"
                                        onClick={() => removeTime(timeName)}
                                      >
                                        ลบ
                                      </button>
                                    </div>
                                  )
                                )}

                                <Form.Item label={false}>
                                  <button
                                    type="button"
                                    onClick={() => addTime()}
                                    className="px-3 py-1 bg-blue-500 text-white rounded"
                                  >
                                    + เพิ่มช่วงเวลา
                                  </button>
                                </Form.Item>
                              </>
                            )}
                          </Form.List>
                        </Form.Item>

                        {/* ปุ่มลบวิชา */}
                        <button
                          type="button"
                          className="px-3 py-1 bg-red-600 text-white rounded mt-2"
                          onClick={() => removeSubject(name)}
                        >
                          ลบวิชา
                        </button>
                      </div>
                    );
                  })}

                  <Form.Item>
                    <button
                      type="button"
                      onClick={() => addSubject()}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      + เพิ่มวิชา
                    </button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
        </Modal>

        {/* Modal ลบ */}
        <Modal
          title={`ลบตารางเรียน (${selectedDate?.format("DD/MM/YYYY")})`}
          open={isDeleteOpen}
          onCancel={() => setIsDeleteOpen(false)}
          footer={null}
        >
          {deleteList.length === 0 ? (
            <p className="text-gray-500">ไม่มีตารางเรียนในวันนี้</p>
          ) : (
            <div className="space-y-2">
              {deleteList.map((item) => {
                const subject = subjects.find((s) => s.name === item.subject);
                const color = parseColor(subject?.color);
                const iconName = subject?.icon || "BookOutlined";
                const name = subject?.name || item.subject;

                return (
                  <div
                    key={item._id}
                    className="flex items-center justify-between px-3 py-2 rounded shadow-sm"
                    style={{
                      background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                      color: "white",
                    }}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {getIcon(iconName, "white")}
                      <span className="truncate">
                        {name} ({item.start}){" "}
                        {item.location ? `📍${item.location}` : ""}
                      </span>
                    </div>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                      onClick={() => handleDelete(item)}
                    >
                      ลบ
                    </button>
                  </div>
                );
              })}

              {/* ปุ่มลบทั้งหมด */}
              <div className="flex justify-end pt-2">
                <button
                  className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
                  onClick={() => {
                    Modal.confirm({
                      title: "ยืนยันการลบทั้งหมด",
                      content: `คุณแน่ใจหรือไม่ว่าต้องการลบตารางเรียนทั้งหมดของวันที่ ${selectedDate?.format(
                        "DD/MM/YYYY"
                      )}?`,
                      okText: "ลบทั้งหมด",
                      cancelText: "ยกเลิก",
                      okButtonProps: { danger: true },
                      async onOk() {
                        try {
                          setLoading(true);
                          await Promise.all(
                            deleteList.map((ev) =>
                              fetch("/api/events", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: ev._id }),
                              })
                            )
                          );
                          await fetchData();
                          message.success("ลบตารางเรียนทั้งหมดเรียบร้อย ✅");

                          setIsDeleteOpen(false);
                          setSelectedDate(null);
                        } catch (err) {
                          console.error(err);
                          message.error("ลบทั้งหมดไม่สำเร็จ ❌");
                        } finally {
                          setLoading(false);
                        }
                      },
                    });
                  }}
                >
                  ลบทั้งหมด
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Spin>
  );
};

export default ScheduleMonth;
