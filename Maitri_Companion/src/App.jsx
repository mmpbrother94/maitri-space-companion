import { Routes, Route, Link } from "react-router-dom";
import Index from "./Pages/Index";
import Dashboard from "./Pages/Dashboard";
import Emotion from "./Pages/Emotion";
import Intervetion from "./Pages/Intervetion";
import Report from "./Pages/Report";
import MissionControll from "./Pages/MissionControll";
import BreathingExerciseDetail from "./IntervetionPages/BreathingExerciseDetail";
import MindfulnessMeditationDetail from "./IntervetionPages/MindfulnessMeditationDetail";
import ProgressiveMuscleRelaxationDetail from "./IntervetionPages/ProgressiveMuscleRelaxationDetail";
import PositiveAffirmationsDetail from "./IntervetionPages/PositiveAffirmationsDetail";
import GuidedImageryDetail from "./IntervetionPages/GuidedImageryDetail";
import CalendarScheduler from "./Pages/CalendarScheduler";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<MissionControll />} />
          <Route path="emotions" element={<Emotion />} />
          <Route path="interventions" element={<Intervetion />} />
          <Route
            path="interventions/breathing"
            element={<BreathingExerciseDetail />}
          />
          <Route
            path="interventions/mindfullness"
            element={<MindfulnessMeditationDetail />}
          />
          <Route
            path="interventions/progressmuscle"
            element={<ProgressiveMuscleRelaxationDetail />}
          />
          <Route
            path="interventions/positiveaffirmation"
            element={<PositiveAffirmationsDetail />}
          />
          <Route
            path="interventions/guideimagery"
            element={<GuidedImageryDetail />}
          />
          <Route path="reports" element={<Report />} />
          <Route path="reports/calendar" element={<CalendarScheduler />} />
        </Route>
        {/* fallback to Index */}
        <Route path="*" element={<Index />} />
      </Routes>
    </>
  );
}
export default App;
