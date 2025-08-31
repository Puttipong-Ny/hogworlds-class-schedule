import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import ScheduleMonth from "./pages/ScheduleMonth";
import ScheduleWeek from "./pages/ScheduleWeek";
import ScheduleWeek2 from "./pages/ScheduleWeek2";
import SettingSubject from "./pages/SettingSubject";
import { Suspense } from "react";
import MapOverview from "./pages/Map";
import SettingYear from "./pages/SettingYear";
import SettingLocation from "./pages/SettingLocation";
import Setting from "./pages/Setting";
import SchedulePage from "./pages/SchedulePage";
import LoadingPage from "./components/Layout/LoadingPage";

function App() {
  const years = ["year1", "year2", "year3"];

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          {/* {years.map((y) => (
            <React.Fragment key={y}>
              <Route path=":year/schedule-month" element={<ScheduleMonth />} />
              <Route path=":year/schedule-week" element={<ScheduleWeek />} />
              <Route path=":year/schedule-week-2" element={<ScheduleWeek2 />} />
            </React.Fragment>
          ))} */}

          <Route path="/:year/schedule" element={<SchedulePage />} />

          <Route path="map" element={<MapOverview />} />
          {/* Setting */}
          <Route path="setting" element={<Setting />} />
          <Route path="setting-year" element={<SettingYear />} />
          <Route path="setting-subject" element={<SettingSubject />} />
          <Route path="setting-location" element={<SettingLocation />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
