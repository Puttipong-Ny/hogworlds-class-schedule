import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  ColorPicker,
  Checkbox,
  Radio,
  Space,
  message,
  Typography,
  Grid,
  Row,
  Col,
  Divider,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import * as AntdIcons from "@ant-design/icons";

const { Title, Text } = Typography;
const CheckboxGroup = Checkbox.Group;

// ----------------------------- YEAR -----------------------------
const yearOptions = [
  { label: "ปี 1", value: "1" },
  { label: "ปี 2", value: "2" },
  { label: "ปี 3", value: "3" },
  { label: "ปี 4", value: "4" },
  { label: "ปี 5", value: "5" },
  { label: "ปี 6", value: "6" },
  { label: "ปี 7", value: "7" },
];

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}
function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

// ----------------------------- SUBJECT -----------------------------
type SubjectItem = {
  _id?: string;
  name: string;
  color: string;
  icon: string;
  professors: string[];
};
const iconOptions = Object.keys(AntdIcons).map((key) => {
  const IconComponent = (AntdIcons as any)[key];
  return {
    label: (
      <span className="flex items-center gap-2">
        <IconComponent /> {key}
      </span>
    ),
    value: key,
  };
});

// ----------------------------- LOCATION -----------------------------
type LocationItem = {
  _id?: string;
  name: string;
  floor: number;
  type: string;
};
const typeOptions = [
  { label: "ห้องเรียน", value: "classroom" },
  { label: "ข้างนอก", value: "outside" },
  { label: "อื่นๆ", value: "other" },
];

// ----------------------------- MAIN COMPONENT -----------------------------
const Setting: React.FC = () => {
  // YEAR state
  const allYears = yearOptions.map((y) => y.value);
  const [years, setYears] = useState<string[]>(allYears);
  const [mainYear, setMainYear] = useState<string>(allYears[0]);

  // SUBJECT state
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [isSubjectModal, setIsSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(
    null
  );

  // LOCATION state
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isLocationModal, setIsLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(
    null
  );

  // PROFESSOR  state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [professors, setProfessors] = useState<string[]>([]);
  const [newProfessor, setNewProfessor] = useState<string>("");

  const [subjectForm] = Form.useForm();
  const [locationForm] = Form.useForm();

  // ----------------------------- YEAR effect -----------------------------
  useEffect(() => {
    const savedYears = getCookie("userYears");
    const savedMain = getCookie("mainYear");
    if (savedYears) {
      const arr = savedYears.split(",");
      setYears(arr);
      setMainYear(savedMain && arr.includes(savedMain) ? savedMain : arr[0]);
    } else {
      setYears(allYears);
      setMainYear(allYears[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      const subj = subjects.find((s) => s._id === selectedSubjectId);
      setProfessors(subj?.professors || []);
    }
  }, [selectedSubjectId, subjects]);

  const handleYearChange = (vals: string[]) => {
    if (vals.length === 0) {
      message.warning("ต้องเลือกอย่างน้อย 1 ชั้นปี");
      return;
    }
    setYears(vals);
    if (!vals.includes(mainYear)) {
      setMainYear(vals[0]);
    }
  };
  const handleYearSave = () => {
    setCookie("userYears", years.join(","), 365);
    setCookie("mainYear", mainYear, 365);
    message.success(
      `บันทึกแล้ว! ปีหลักของคุณคือ ปี ${mainYear}, และคุณเลือกดู ${years.join(
        ", "
      )}`
    );
  };

  const handleAddProfessor = () => {
    if (!newProfessor) return;
    if (professors.includes(newProfessor)) {
      message.warning("ศาสตราจารย์นี้มีอยู่แล้ว");
      return;
    }
    setProfessors([...professors, newProfessor]);
    setNewProfessor("");
  };

  const handleRemoveProfessor = (name: string) => {
    setProfessors(professors.filter((p) => p !== name));
  };

  const handleSaveProfessors = async () => {
    if (!selectedSubjectId) {
      message.warning("กรุณาเลือกวิชา");
      return;
    }
    try {
      await fetch("/api/subjects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedSubjectId, professors }),
      });
      message.success("บันทึกอาจารย์เรียบร้อย ✅");
      fetchSubjects(); // reload list subjects
    } catch (err) {
      console.error(err);
      message.error("บันทึกไม่สำเร็จ ❌");
    }
  };

  // ----------------------------- SUBJECT CRUD -----------------------------
  const fetchSubjects = async () => {
    setSubjectLoading(true);
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      console.error(err);
      message.error("โหลดข้อมูลวิชาไม่สำเร็จ ❌");
    } finally {
      setSubjectLoading(false);
    }
  };
  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubjectOk = async () => {
    try {
      const values = await subjectForm.validateFields();
      const payload: SubjectItem = {
        name: values.name,
        color:
          typeof values.color === "string"
            ? values.color
            : values.color.toHexString(),
        icon: values.icon,
        professors: values.professors || [], // ✅ เก็บ array
      };

      setSubjectLoading(true);
      if (editingSubject) {
        await fetch("/api/subjects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSubject._id, ...payload }),
        });
        message.success("แก้ไขวิชาเรียบร้อย ✅");
      } else {
        await fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        message.success("เพิ่มวิชาเรียบร้อย ✅");
      }
      await fetchSubjects();
      setIsSubjectModal(false);
      subjectForm.resetFields();
    } catch (err) {
      console.error(err);
      message.error("บันทึกวิชาไม่สำเร็จ ❌");
    } finally {
      setSubjectLoading(false);
    }
  };

  // ----------------------------- LOCATION CRUD -----------------------------
  const fetchLocations = async () => {
    setLocationLoading(true);
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error(err);
      message.error("โหลดข้อมูลสถานที่ไม่สำเร็จ ❌");
    } finally {
      setLocationLoading(false);
    }
  };
  useEffect(() => {
    fetchLocations();
  }, []);

  const handleLocationOk = async (values: LocationItem) => {
    try {
      const payload: LocationItem = { ...values };
      setLocationLoading(true);
      if (editingLocation) {
        await fetch("/api/locations", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingLocation._id, ...payload }),
        });
        message.success("แก้ไขสถานที่เรียบร้อย ✅");
      } else {
        await fetch("/api/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        message.success("เพิ่มสถานที่เรียบร้อย ✅");
      }
      await fetchLocations();
      setIsLocationModal(false);
      locationForm.resetFields();
    } catch (err) {
      console.error(err);
      message.error("บันทึกสถานที่ไม่สำเร็จ ❌");
    } finally {
      setLocationLoading(false);
    }
  };

  // ----------------------------- COLUMNS -----------------------------
  const subjectColumns = [
    { title: "วิชา", dataIndex: "name", key: "name" },
    {
      title: "สี",
      dataIndex: "color",
      key: "color",
      render: (c: string) => (
        <div
          style={{ width: 40, height: 20, background: c, borderRadius: 4 }}
        />
      ),
    },
    {
      title: "ไอคอน",
      dataIndex: "icon",
      key: "icon",
      width: 80,
      render: (icon: string) => {
        const IconComponent = (AntdIcons as any)[icon];
        return IconComponent ? <IconComponent /> : icon;
      },
    },
    {
      title: "อาจารย์ผู้สอน",
      dataIndex: "professors",
      key: "professors",
      render: (list: string[]) => list?.join(", "),
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_: any, r: SubjectItem) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditingSubject(r);
              subjectForm.setFieldsValue(r);
              setIsSubjectModal(true);
            }}
          >
            แก้ไข
          </Button>
          <Button
            type="link"
            danger
            onClick={async () => {
              await fetch("/api/subjects", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: r._id }),
              });
              fetchSubjects();
            }}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];
  const locationColumns = [
    { title: "ชื่อสถานที่", dataIndex: "name", key: "name" },
    { title: "ชั้น", dataIndex: "floor", key: "floor" },
    {
      title: "ประเภท",
      dataIndex: "type",
      key: "type",
      render: (t: string) => typeOptions.find((x) => x.value === t)?.label || t,
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_: any, r: LocationItem) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditingLocation(r);
              locationForm.setFieldsValue(r);
              setIsLocationModal(true);
            }}
          >
            แก้ไข
          </Button>
          <Button
            type="link"
            danger
            onClick={async () => {
              await fetch("/api/locations", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: r._id }),
              });
              fetchLocations();
            }}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  // ----------------------------- RENDER -----------------------------
  return (
    <Row gutter={[16, 24]}>
      {/* YEAR */}
      <Col span={12}>
        <Card>
          <Title level={3}>⚙️ ตั้งค่าชั้นปี</Title>

          {/* ใช้ Row ครอบ แล้วแบ่ง Col ซ้าย/ขวา */}
          <Row gutter={16}>
            {/* ซ้าย: CheckboxGroup */}
            <Col span={12}>
              <Text className="block mt-4">เลือกปีที่มองเห็น:</Text>
              <CheckboxGroup
                className="flex flex-col mt-2"
                options={yearOptions}
                value={years}
                onChange={(vals) => handleYearChange(vals as string[])}
              />
            </Col>

            {/* ขวา: RadioGroup */}
            <Col span={12}>
              <Text className="block mt-4">เลือกปีหลักของคุณ:</Text>
              <Radio.Group
                className="flex flex-col mt-2"
                value={mainYear}
                onChange={(e) => setMainYear(e.target.value)}
              >
                {years.map((y) => (
                  <Radio key={y} value={y}>
                    ปี {y}
                  </Radio>
                ))}
              </Radio.Group>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={3}>
              <Button type="primary" className="mt-3" onClick={handleYearSave}>
                บันทึก
              </Button>
            </Col>
            <Col span={12}>
              <Text type="secondary" className="block mt-4">
                📌 ปีหลัก: <b>{mainYear}</b> | ปีที่เลือก: {years.join(", ")}
              </Text>
            </Col>
          </Row>
        </Card>
      </Col>
      {/* PROFESSORS */}
      <Col span={12}>
        <Card>
          <div className="flex justify-between items-center mb-3">
            <Title level={3}>👨‍🏫 ตั้งค่าศาสตราจารย์</Title>
          </div>

          {/* เลือกวิชา */}
          <Select
            className="w-full mb-3"
            placeholder="เลือกวิชา"
            value={selectedSubjectId || undefined}
            onChange={(val) => setSelectedSubjectId(val)}
            options={subjects.map((s) => ({ label: s.name, value: s._id! }))}
          />

          {/* แสดงรายชื่ออาจารย์ */}
          <ul className="mb-3">
            {professors.map((p) => (
              <li
                key={p}
                className="flex justify-between items-center border p-1 rounded mb-1"
              >
                <span>{p}</span>
                <Button
                  danger
                  size="small"
                  onClick={() => handleRemoveProfessor(p)}
                >
                  ลบ
                </Button>
              </li>
            ))}
          </ul>

          {/* เพิ่มอาจารย์ใหม่ */}
          <Space className="mb-3">
            <Input
              placeholder="ชื่ออาจารย์ใหม่"
              value={newProfessor}
              onChange={(e) => setNewProfessor(e.target.value)}
            />
            <Button type="primary" onClick={handleAddProfessor}>
              เพิ่ม
            </Button>
          </Space>

          <Button type="primary" onClick={handleSaveProfessors}>
            บันทึก
          </Button>
        </Card>
      </Col>

      {/* SUBJECT */}
      <Row gutter={[16, 24]}>
        <Col span={12}>
          <Card>
            <div className="flex justify-between items-center mb-3">
              <Title level={3}>📚 ตั้งค่าวิชา</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingSubject(null);
                  subjectForm.resetFields();
                  setIsSubjectModal(true);
                }}
              >
                เพิ่มวิชา
              </Button>
            </div>
            <Table
              dataSource={subjects}
              columns={subjectColumns}
              loading={subjectLoading}
              rowKey="_id"
              pagination={false}
              scroll={{ y: "calc(80vh - 300px)" }}
            />
          </Card>
        </Col>
        <Modal
          title={editingSubject ? "แก้ไขวิชา" : "เพิ่มวิชา"}
          open={isSubjectModal}
          onOk={handleSubjectOk}
          onCancel={() => setIsSubjectModal(false)}
          confirmLoading={subjectLoading}
        >
          <Form form={subjectForm} layout="vertical">
            <Form.Item
              name="name"
              label="ชื่อวิชา"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="color" label="สี" rules={[{ required: true }]}>
              <ColorPicker format="hex" />
            </Form.Item>

            <Form.Item name="icon" label="ไอคอน" rules={[{ required: true }]}>
              <Select options={iconOptions} showSearch />
            </Form.Item>

            {/* ✅ Professors */}
            <Form.List name="professors">
              {(fields, { add, remove }) => (
                <>
                  <label>อาจารย์ผู้สอน</label>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      align="baseline"
                      style={{ display: "flex", marginBottom: 8 }}
                    >
                      <Form.Item
                        {...restField}
                        name={name}
                        rules={[{ required: true, message: "กรอกชื่ออาจารย์" }]}
                      >
                        <Input placeholder="ชื่ออาจารย์" />
                      </Form.Item>
                      <Button type="link" danger onClick={() => remove(name)}>
                        ลบ
                      </Button>
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    + เพิ่มอาจารย์
                  </Button>
                </>
              )}
            </Form.List>
          </Form>
        </Modal>

        {/* LOCATION */}
        <Col span={12}>
          <Card>
            <div className="flex justify-between items-center mb-3">
              <Title level={3}>📍 ตั้งค่าสถานที่</Title>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingLocation(null);
                  locationForm.resetFields();
                  setIsLocationModal(true);
                }}
              >
                เพิ่มสถานที่
              </Button>
            </div>
            <Table
              dataSource={locations}
              columns={locationColumns}
              loading={locationLoading}
              rowKey="_id"
              pagination={false}
              scroll={{ y: "calc(80vh - 300px)" }}
            />
          </Card>
        </Col>
      </Row>
      <Modal
        title={editingLocation ? "แก้ไขสถานที่" : "เพิ่มสถานที่"}
        open={isLocationModal}
        onOk={() => locationForm.submit()}
        onCancel={() => setIsLocationModal(false)}
        confirmLoading={locationLoading}
      >
        <Form form={locationForm} layout="vertical" onFinish={handleLocationOk}>
          <Form.Item
            name="name"
            label="ชื่อสถานที่"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="floor" label="ชั้น" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={-5} max={5} />
          </Form.Item>

          <Form.Item
            name="type"
            label="ประเภทห้อง"
            rules={[{ required: true }]}
          >
            <Select options={typeOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

export default Setting;
