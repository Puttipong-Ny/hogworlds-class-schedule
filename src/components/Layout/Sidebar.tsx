import React, { useEffect, useState } from "react";
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
  const location = useLocation(); 
   const [openKeys, setOpenKeys] = useState<string[]>([])

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
          key: "year-1",
          label: "ปี 1",
          children: [
            {
              key: "/year1/schedule-month",
              icon: <ScheduleOutlined />,
              label: "รายเดือน",
              onClick: () => navigate("/year1/schedule-month"),
            },
            {
              key: "/year1/schedule-week",
              icon: <SnippetsOutlined />,
              label: "รายสัปดาห์",
              onClick: () => navigate("/year1/schedule-week"),
            },
            {
              key: "/year1/schedule-week-2",
              icon: <SnippetsOutlined />,
              label: "รายสัปดาห์ แบบที่ 2",
              onClick: () => navigate("/year1/schedule-week-2"),
            },
          ],
        },
        {
          key: "year-2",
          label: "ปี 2",
          children: [
            {
              key: "/year2/schedule-month",
              icon: <ScheduleOutlined />,
              label: "รายเดือน",
              onClick: () => navigate("/year2/schedule-month"),
            },
            {
              key: "/year2/schedule-week",
              icon: <SnippetsOutlined />,
              label: "รายสัปดาห์",
              onClick: () => navigate("/year2/schedule-week"),
            },
            {
              key: "/year2/schedule-week-2",
              icon: <SnippetsOutlined />,
              label: "รายสัปดาห์ แบบที่ 2",
              onClick: () => navigate("/year2/schedule-week-2"),
            },
          ],
        },
        {
          key: "year-3",
          label: "ปี 3",
          children: [
            {
              key: "/year3/schedule-month",
              icon: <ScheduleOutlined />,
              label: "รายเดือน",
              onClick: () => navigate("/year3/schedule-month"),
            },
            {
              key: "/year3/schedule-week",
              icon: <SnippetsOutlined />,
              label: "รายสัปดาห์",
              onClick: () => navigate("/year3/schedule-week"),
            },
            {
              key: "/year3/schedule-week-2",
              icon: <SnippetsOutlined />,
              label: "รายสัปดาห์ แบบที่ 2",
              onClick: () => navigate("/year3/schedule-week-2"),
            },
          ],
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

  useEffect(() => {
    const path = location.pathname;
    const newOpenKeys: string[] = [];

    menuItems.forEach((item) => {
      if (item.children) {
        item.children.forEach((child) => {
          if (child.children?.some((sub) => sub.key === path)) {
            newOpenKeys.push(item.key, child.key);
          } else if (child.key === path) {
            newOpenKeys.push(item.key);
          }
        });
      }
    });

    setOpenKeys(newOpenKeys);
  }, [location.pathname]);

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
        selectedKeys={[location.pathname]}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys as string[])}
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
