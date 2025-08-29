import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  ColorPicker,
  Space,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import * as AntdIcons from "@ant-design/icons";

type SubjectItem = {
  _id?: string;
  name: string;
  color: string;
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
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(
    null
  );
  const [form] = Form.useForm();

  // ✅ โหลด subjects
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      console.error(err);
      message.error("โหลดข้อมูลไม่สำเร็จ ❌");
    } finally {
      setLoading(false);
    }
  };

  // เปิด Modal เพิ่ม
  const handleAdd = () => {
    setEditingSubject(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  // เปิด Modal แก้ไข
  const handleEdit = (record: SubjectItem) => {
    setEditingSubject(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  // ✅ กดบันทึก
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload: SubjectItem = {
        name: values.name,
        color:
          typeof values.color === "string"
            ? values.color
            : values.color.toHexString(),
        icon: values.icon,
      };

      setLoading(true);

      if (editingSubject) {
        // update
        await fetch("/api/subjects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingSubject._id, ...payload }),
        });
        message.success("แก้ไขวิชาเรียบร้อย ✅");
      } else {
        // create
        await fetch("/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        message.success("เพิ่มวิชาเรียบร้อย ✅");
      }

      await fetchSubjects();
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
      content: "คุณแน่ใจหรือไม่ที่จะลบวิชานี้?",
      okText: "ลบ",
      okType: "danger",
      cancelText: "ยกเลิก",
      onOk: async () => {
        setLoading(true);
        try {
          await fetch("/api/subjects", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          message.success("ลบวิชาเรียบร้อย ✅");
          await fetchSubjects();
        } catch (err) {
          console.error(err);
          message.error("ลบไม่สำเร็จ ❌");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subjects/seed", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        message.success(
          `Reset และ Insert default ${data.inserted} วิชาแล้ว ✅`
        );
        fetchSubjects();
      } else {
        message.error("Set Default ล้มเหลว ❌");
      }
    } catch (err) {
      console.error(err);
      message.error("Set Default ล้มเหลว ❌");
    } finally {
      setLoading(false);
    }
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
    <div className="p-6 bg-white rounded-xl shadow-lg" style={{ width: "1600px" }}>
      <h2 className="text-2xl font-bold mb-4 text-gray-800">⚙️ ตั้งค่าวิชา</h2>

      <Space className="mb-4">
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          เพิ่มวิชา
        </Button>

        {/* <Button icon={<ReloadOutlined />} danger onClick={handleSeed}>
          Set Default
        </Button> */}
      </Space>

      <Table
        loading={loading}
        dataSource={subjects}
        columns={columns}
        rowKey="_id"
        pagination={false}
        bordered
        scroll={{ y: "calc(100vh - 300px)" }}
      />

      <Modal
        title={editingSubject ? "แก้ไขวิชา" : "เพิ่มวิชา"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={loading}
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
