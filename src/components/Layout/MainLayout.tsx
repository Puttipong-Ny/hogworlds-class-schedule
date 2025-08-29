import React, { useState } from "react"
import { Layout } from "antd"
import Sidebar from "./Sidebar"
import { Outlet } from "react-router-dom"

const { Content } = Layout

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? 80 : 240 // 👈 fix ความกว้าง sidebar

  return (
    <Layout className="h-screen w-screen">
      <Sidebar collapsed={collapsed} toggleCollapse={() => setCollapsed(!collapsed)} />
      <Layout
        className="!bg-gray-100"
        style={{ width: `calc(100vw - ${sidebarWidth}px)` }} // 👈 fix content width
      >
        <Content className="p-6 overflow-auto h-full">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}


export default MainLayout
