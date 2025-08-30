import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

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

const SettingLocation: React.FC = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(
    null
  );
  const [form] = Form.useForm();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error(err);
      message.error("โหลดข้อมูลไม่สำเร็จ ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingLocation(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: LocationItem) => {
    setEditingLocation(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleOk = async (values: LocationItem) => {
    try {
      const payload: LocationItem = { ...values };

      setLoading(true);
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
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("บันทึกไม่สำเร็จ ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "ยืนยันการลบ",
      content: "คุณแน่ใจหรือไม่ที่จะลบสถานที่นี้?",
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        setLoading(true);
        try {
          await fetch("/api/locations", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          message.success("ลบสถานที่เรียบร้อย ✅");
          await fetchLocations();
        } catch (err) {
          console.error(err);
          message.error("ลบไม่สำเร็จ ❌");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    { title: "ชื่อสถานที่", dataIndex: "name", key: "name" },
    { title: "ชั้น", dataIndex: "floor", key: "floor" },
    {
      title: "ประเภท",
      dataIndex: "type",
      key: "type",
      render: (type: string) =>
        typeOptions.find((t) => t.value === type)?.label || type,
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_: any, record: LocationItem) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            แก้ไข
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id!)}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div
      className="p-6 bg-white rounded-xl shadow-lg"
      style={{ width: "1200px" }}
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        📍 ตั้งค่าสถานที่เรียน
      </h2>

      <Space className="mb-4">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          เพิ่มสถานที่
        </Button>
      </Space>

      <Table
        loading={loading}
        dataSource={locations}
        columns={columns}
        rowKey="_id"
        pagination={false}
        bordered
        scroll={{ y: "calc(100vh - 300px)" }}
      />

      <Modal
        title={editingLocation ? "แก้ไขสถานที่" : "เพิ่มสถานที่"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleOk}>
          <Form.Item
            name="name"
            label="ชื่อสถานที่"
            rules={[{ required: true, message: "กรุณากรอกชื่อสถานที่" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="floor"
            label="ชั้น"
            rules={[{ required: true, message: "กรุณากรอกเลขชั้น" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="type"
            label="ประเภทห้อง"
            rules={[{ required: true, message: "กรุณาเลือกประเภทห้อง" }]}
          >
            <Select options={typeOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettingLocation;
