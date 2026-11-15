import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import AvailableExams from "./pages/student/AvailableExam";
import MyResults from "./pages/student/MyResult";
import AttendExam from "./pages/student/AttendExam";
import Exam from "./pages/student/Exam";
import AttemptedExams from "./pages/student/AttempedExams";
import CreateExam from "./pages/teacher/CreateExam";
import StudentProfile from "./pages/student/StudentProfile";
import ChangePassword from "./pages/student/ChangePassword";
import MyExams from "./pages/teacher/MyExams";
import ExamResults from "./pages/teacher/ExamResults";
import EditExam from "./pages/teacher/EditExam";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import EditStudentProfile from "./pages/student/EditStudentProfile";
import ChangeTeacherPassword from "./pages/teacher/ChangeTeacherPassword";
import EditTeacherProfile from "./pages/teacher/EditTeacherProfile";
import ViewExam from "./pages/teacher/ViewExam";
    



function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/student/:username/dashboard" element={<StudentDashboard />} />
                <Route path="/student/:username/available-exams" element={<AvailableExams />} />
                <Route path="/student/:username/results" element={<MyResults />} />
                <Route path="/student/:username/attend-exam/:examId" element={<AttendExam />} />
                <Route path="/student/exam/:examId" element={<Exam />} />
                <Route path="/student/:username/attempted-exams" element={<AttemptedExams />} />
                <Route path="/student/:username/profile" element={<StudentProfile />} />
                <Route path="/student/:username/change-password" element={<ChangePassword />} />
                <Route path="/student/:username/edit-profile" element={<EditStudentProfile />} />


                <Route path="/teacher/:username/dashboard" element={<TeacherDashboard />} />
                <Route path="/teacher/:username/create-exam" element={<CreateExam />} />
                <Route path="/teacher/:username/my-exams" element={<MyExams />} />
                <Route path="/teacher/:username/exam-results" element={<ExamResults />} />
                <Route path="/teacher/:username/edit-exam/:examId" element={<EditExam />} />
                <Route path="/teacher/:username/profile" element={<TeacherProfile />} />
                <Route path="/teacher/:username/change-password" element={<ChangeTeacherPassword />} />
                <Route path="/teacher/:username/edit-profile" element={<EditTeacherProfile />} />
                <Route path="/teacher/:username/view-exam/:examId" element={<ViewExam />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;