import React from "react"
import { Card } from "antd"
import {
  CalendarOutlined,
  BarChartOutlined,
  NotificationOutlined,
  SettingOutlined,
} from "@ant-design/icons"

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          📊 Dashboard (Pending)
        </h1>
        <p className="text-gray-500">ภาพรวมและการเข้าถึงเมนูลัดของระบบ</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <CalendarOutlined className="text-2xl text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">ตารางเรียนวันนี้</p>
              <p className="text-xl font-bold">3 วิชา</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <BarChartOutlined className="text-2xl text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">คาบเรียนสัปดาห์นี้</p>
              <p className="text-xl font-bold">12 คาบ</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-xl shadow hover:shadow-lg transition">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <NotificationOutlined className="text-2xl text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">ประกาศใหม่</p>
              <p className="text-xl font-bold">5 เรื่อง</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ข่าวสาร */}
        <Card
          title="📢 ข่าวสาร OOC"
          className="rounded-xl shadow hover:shadow-lg transition"
        >
          <ul className="space-y-2">
            <li className="border-b pb-2">[29/08/2025] เปิดรับสมัครสอบ</li>
            <li className="border-b pb-2">[30/08/2025] ตารางสอบกลางภาคออกแล้ว</li>
            <li>[31/08/2025] ประกาศหยุดเรียนพิเศษ</li>
          </ul>
        </Card>

        {/* Mini Calendar */}
        <Card
          title="🗓 ปฏิทินย่อ"
          className="rounded-xl shadow hover:shadow-lg transition"
        >
          <div className="flex justify-center items-center h-48 text-gray-400">
            <CalendarOutlined className="text-5xl" />
            <span className="ml-2">Mini Calendar Placeholder</span>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card
          title="⚡ เมนูลัด"
          className="rounded-xl shadow hover:shadow-lg transition"
        >
          <div className="grid grid-cols-2 gap-4">
            <button className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              ➕ เพิ่มวิชา
            </button>
            <button className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              📅 ตารางเดือน
            </button>
            <button className="px-3 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600">
              📊 ตารางสัปดาห์
            </button>
            <button className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              ⚙️ ตั้งค่า
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
