import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./components/Layout/MainLayout"
import Dashboard from "./pages/Dashboard"
import ScheduleMonth from "./pages/ScheduleMonth"
import ScheduleWeek from "./pages/ScheduleWeek"
import SettingSubject from "./pages/SettingSubject"   
import ScheduleWeek2 from "./pages/ScheduleWeek2"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="schedule-month" element={<ScheduleMonth />} />
          <Route path="schedule-week" element={<ScheduleWeek />} />
          <Route path="setting-subject" element={<SettingSubject />} /> 
          <Route path="schedule-week-2" element={<ScheduleWeek2 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
