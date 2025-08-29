import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import ScheduleMonth from "./pages/ScheduleMonth";
import ScheduleWeek from "./pages/ScheduleWeek";
import ScheduleWeek2 from "./pages/ScheduleWeek2";
import SettingSubject from "./pages/SettingSubject";
import React from "react";

function App() {
  const years = ["year1", "year2", "year3"];

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          {years.map((y) => (
            <React.Fragment key={y}>
              <Route path=":year/schedule-month" element={<ScheduleMonth />} />
              <Route path=":year/schedule-week" element={<ScheduleWeek />} />
              <Route path=":year/schedule-week-2" element={<ScheduleWeek2 />} />
            </React.Fragment>
          ))}

          {/* Setting */}
          <Route path="setting-subject" element={<SettingSubject />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
