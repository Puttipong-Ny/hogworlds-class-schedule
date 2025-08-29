import React from "react";
import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  SettingOutlined,
  AppstoreOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ScheduleOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/ravenclaw.png";

const { Sider } = Layout;

type SidebarProps = {
  collapsed: boolean;
  toggleCollapse: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ hook เอา path ปัจจุบันมาใช้

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "หน้าหลัก",
      onClick: () => navigate("/"),
    },
    {
      key: "class-schedule",
      icon: <AppstoreOutlined />,
      label: "ตารางเรียน",
      children: [
        {
          key: "/schedule-month",
          icon: <ScheduleOutlined />,
          label: "รายเดือน",
          onClick: () => navigate("/schedule-month"),
        },
        {
          key: "/schedule-week",
          icon: <SnippetsOutlined />,
          label: "รายสัปดาห์",
          onClick: () => navigate("/schedule-week"),
        },
        {
          key: "/schedule-week-2",
          icon: <SnippetsOutlined />,
          label: "รายสัปดาห์ แบบที่ 2",
          onClick: () => navigate("/schedule-week-2"),
        },
      ],
    },
    {
      key: "/setting-subject",
      icon: <SettingOutlined />,
      label: "ตั้งค่า",
      onClick: () => navigate("/setting-subject"),
    },
  ];

  // ✅ คำนวณ openKeys สำหรับ submenu
  const currentPath = location.pathname;
  const defaultOpenKeys = menuItems
    .filter((item) => item.children?.some((child) => child.key === currentPath))
    .map((item) => item.key);

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={240}
      className="!bg-white flex flex-col justify-between shadow-md relative"
    >
      {/* Logo + Title */}
      <div className="flex items-center justify-center p-3 border-b">
        <img src={logo} alt="Ravenclaw" className="h-10 w-10 mr-2" />
        {!collapsed && (
          <span className="font-bold text-lg text-black">Ravenclaw</span>
        )}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[currentPath]}   // ✅ highlight เมนูตาม path จริง
        defaultOpenKeys={defaultOpenKeys} // ✅ เปิด submenu ถ้าตรงกับ path
        items={menuItems}
        style={{ flex: 1, borderRight: 0 }}
      />

      {/* Footer (Lang + User) */}
      <div className="border-t p-3 flex flex-col gap-2"></div>

      {/* ปุ่มย่อ/ขยายติดกับ sidebar */}
      <div
        className="absolute top-3 -right-3 bg-gray-200 hover:bg-gray-400 text-gray-700 
             rounded-full shadow-md cursor-pointer p-2 transition duration-200"
        onClick={toggleCollapse}
      >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>
    </Sider>
  );
};

export default Sidebar;
  