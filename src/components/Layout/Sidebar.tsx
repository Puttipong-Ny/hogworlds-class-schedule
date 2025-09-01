import React, { useEffect, useState } from "react";
import { Layout, Menu, type MenuProps } from "antd";
import {
  HomeOutlined,
  SettingOutlined,
  AppstoreOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ScheduleOutlined,
  SnippetsOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/ravenclaw.png";

const { Sider } = Layout;

type SidebarProps = {
  collapsed: boolean;
  toggleCollapse: () => void;
};

// ✅ อ่านค่า cookie
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // ✅ อ่านค่าชั้นปีและ flag จาก cookie
  const allYears = ["1", "2", "3"];
  const savedYears = getCookie("userYears")?.split(",") || allYears;
  // ✅ สร้างเมนูรายปี
  const classScheduleChildren: MenuProps["items"] = [];

  // if (savedYears.includes("1")) {
  //   classScheduleChildren.push({
  //     key: "year-1",
  //     label: "ปี 1",
  //     children: [
  //       {
  //         key: "/year1/schedule-month",
  //         icon: <ScheduleOutlined />,
  //         label: "รายเดือน",
  //         onClick: () => navigate("/year1/schedule-month"),
  //       },
  //       {
  //         key: "/year1/schedule-week",
  //         icon: <SnippetsOutlined />,
  //         label: "รายสัปดาห์",
  //         onClick: () => navigate("/year1/schedule-week"),
  //       },
  //       {
  //         key: "/year1/schedule-week-2",
  //         icon: <SnippetsOutlined />,
  //         label: "รายสัปดาห์ แบบที่ 2",
  //         onClick: () => navigate("/year1/schedule-week-2"),
  //       },
  //     ],
  //   });
  // }

  // if (savedYears.includes("2")) {
  //   classScheduleChildren.push({
  //     key: "year-2",
  //     label: "ปี 2",
  //     children: [
  //       {
  //         key: "/year2/schedule-month",
  //         icon: <ScheduleOutlined />,
  //         label: "รายเดือน",
  //         onClick: () => navigate("/year2/schedule-month"),
  //       },
  //       {
  //         key: "/year2/schedule-week",
  //         icon: <SnippetsOutlined />,
  //         label: "รายสัปดาห์",
  //         onClick: () => navigate("/year2/schedule-week"),
  //       },
  //       {
  //         key: "/year2/schedule-week-2",
  //         icon: <SnippetsOutlined />,
  //         label: "รายสัปดาห์ แบบที่ 2",
  //         onClick: () => navigate("/year2/schedule-week-2"),
  //       },
  //     ],
  //   });
  // }

  // if (savedYears.includes("3")) {
  //   classScheduleChildren.push({
  //     key: "year-3",
  //     label: "ปี 3",
  //     children: [
  //       {
  //         key: "/year3/schedule-month",
  //         icon: <ScheduleOutlined />,
  //         label: "รายเดือน",
  //         onClick: () => navigate("/year3/schedule-month"),
  //       },
  //       {
  //         key: "/year3/schedule-week",
  //         icon: <SnippetsOutlined />,
  //         label: "รายสัปดาห์",
  //         onClick: () => navigate("/year3/schedule-week"),
  //       },
  //       {
  //         key: "/year3/schedule-week-2",
  //         icon: <SnippetsOutlined />,
  //         label: "รายสัปดาห์ แบบที่ 2",
  //         onClick: () => navigate("/year3/schedule-week-2"),
  //       },
  //     ],
  //   });
  // }

  if (savedYears.includes("1")) {
    classScheduleChildren.push({
      key: "/year1/schedule",
      icon: <ScheduleOutlined />,
      label: "ปี 1",
      onClick: () => navigate("/year1/schedule"),
    });
  }

  if (savedYears.includes("2")) {
    classScheduleChildren.push({
      key: "/year2/schedule",
      icon: <ScheduleOutlined />,
      label: "ปี 2",
      onClick: () => navigate("/year2/schedule"),
    });
  }

  if (savedYears.includes("3")) {
    classScheduleChildren.push({
      key: "/year3/schedule",
      icon: <ScheduleOutlined />,
      label: "ปี 3",
      onClick: () => navigate("/year3/schedule"),
    });
  }

  // ✅ menuItems หลัก
  const menuItems: MenuProps["items"] = [
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
      children: classScheduleChildren,
    },
    {
      key: "/map",
      icon: <EnvironmentOutlined />,
      label: "แผนที่",
      onClick: () => navigate("/map"),
    },
    {
      key: "/setting",
      icon: <SettingOutlined />,
      label: "ตั้งค่า",
      onClick: () => navigate("/setting"),
      // children: [
      //   {
      //     key: "/setting-year",
      //     icon: <SettingOutlined />,
      //     label: "รายชั้นปี",
      //     onClick: () => navigate("/setting-year"),
      //   },
      //   {
      //     key: "/setting-subject",
      //     icon: <SettingOutlined />,
      //     label: "รายวิชา",
      //     onClick: () => navigate("/setting-subject"),
      //   },
      //   {
      //     key: "/setting-location",
      //     icon: <SettingOutlined />,
      //     label: "ตั้สถานที่",
      //     onClick: () => navigate("/setting-location"),
      //   },
      // ],
    },
  ];

  // ✅ จัดการ openKeys เวลาเปลี่ยน path
  useEffect(() => {
    const path = location.pathname;
    const newOpenKeys: string[] = [];

    menuItems.forEach((item) => {
      if (item && "children" in item && item.children) {
        item.children.forEach((child) => {
          if (
            child &&
            "children" in child &&
            child.children?.some((sub) => sub?.key === path)
          ) {
            newOpenKeys.push(item.key as string, child.key as string);
          } else if (child?.key === path) {
            newOpenKeys.push(item.key as string);
          }
        });
      }
    });

    setOpenKeys(newOpenKeys);
  }, [location.pathname]);

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

      {/* ปุ่มย่อ/ขยาย */}
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
