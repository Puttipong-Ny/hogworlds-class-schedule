import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, ColorPicker } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import * as AntdIcons from "@ant-design/icons";

type SubjectItem = {
  _id?: string;
  name: string;
  color: string; // hex string
  icon: string;
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

const SettingSubject: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // ✅ โหลด subjects จาก DB
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const res = await fetch("/api/subjects");
    const data = await res.json();
    setSubjects(data);
  };

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newSubject: SubjectItem = {
        name: values.name,
        color:
          typeof values.color === "string"
            ? values.color
            : values.color.toHexString(), // ✅ เก็บ hex
        icon: values.icon,
      };

      await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubject),
      });

      await fetchSubjects(); // โหลดใหม่จาก DB
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/subjects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchSubjects(); 
  };

  const columns = [
    {
      title: "วิชา",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "สี",
      dataIndex: "color",
      key: "color",
      render: (color: string) => (
        <div
          style={{
            width: 40,
            height: 20,
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      ),
    },
    {
      title: "Icon",
      dataIndex: "icon",
      key: "icon",
      render: (icon: string) => {
        const IconComponent = (AntdIcons as any)[icon];
        return IconComponent ? <IconComponent /> : icon;
      },
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_: any, record: SubjectItem) => (
        <Button danger onClick={() => handleDelete(record._id!)}>
          ลบ
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">⚙️ ตั้งค่าวิชา</h2>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAdd}
        style={{ marginBottom: 16 }}
      >
        เพิ่มวิชา
      </Button>

      <Table
        dataSource={subjects}
        columns={columns}
        rowKey="_id"
        pagination={false}
      />

      <Modal
        title="เพิ่มวิชา"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="ชื่อวิชา"
            rules={[{ required: true, message: "กรุณากรอกชื่อวิชา" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="color"
            label="สี"
            rules={[{ required: true, message: "กรุณาเลือกสี" }]}
          >
            <ColorPicker
              format="hex"
              showText={(color) => <span>{color.toHexString()}</span>}
            />
          </Form.Item>

          <Form.Item
            name="icon"
            label="ไอคอน"
            rules={[{ required: true, message: "กรุณาเลือกไอคอน" }]}
          >
            <Select
              showSearch
              placeholder="ค้นหาไอคอน"
              optionFilterProp="label"
              options={iconOptions}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettingSubject;
