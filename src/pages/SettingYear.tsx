import React, { useEffect, useState } from "react";
import { Card, Checkbox, Radio, Button, message, Typography } from "antd";

const { Title, Text } = Typography;
const CheckboxGroup = Checkbox.Group;

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

const yearOptions = [
  { label: "ปี 1", value: "1" },
  { label: "ปี 2", value: "2" },
  { label: "ปี 3", value: "3" },
];

const SettingYear: React.FC = () => {
  const [years, setYears] = useState<string[]>(["1"]);
  const [mainYear, setMainYear] = useState<string>("1");

  useEffect(() => {
    const savedYears = getCookie("userYears");
    const savedMain = getCookie("mainYear");

    if (savedYears) {
      const arr = savedYears.split(",");
      setYears(arr);
      setMainYear(savedMain && arr.includes(savedMain) ? savedMain : arr[0]);
    }
  }, []);

  const handleChange = (vals: string[]) => {
    if (vals.length === 0) {
      message.warning("ต้องเลือกอย่างน้อย 1 ชั้นปี");
      return;
    }
    setYears(vals);
    if (!vals.includes(mainYear)) {
      setMainYear(vals[0]); // ถ้าปีหลักหายไป → reset เป็นตัวแรก
    }
  };

  const handleSave = () => {
    setCookie("userYears", years.join(","), 365);
    setCookie("mainYear", mainYear, 365);
    message.success(
      `บันทึกแล้ว! ปีหลักของคุณคือ ปี ${mainYear}, และคุณเลือกดู ${years.join(
        ", "
      )}`
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-[400px] shadow-lg">
        <Title level={3}>ตั้งค่าชั้นปีของคุณ</Title>

        <Text>เลือกหลายชั้นปีที่ต้องการแสดง:</Text>
        <CheckboxGroup
          className="flex flex-col mt-2"
          options={yearOptions}
          value={years}
          onChange={(vals) => handleChange(vals as string[])}
        />

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

        <Button type="primary" className="w-full mt-4" onClick={handleSave}>
          บันทึกการตั้งค่า
        </Button>

        <Text type="secondary" className="block mt-3">
          📌 ปีหลัก: <b>{mainYear}</b> | ปีที่เลือก: {years.join(", ")}
        </Text>
      </Card>
    </div>
  );
};

export default SettingYear;
