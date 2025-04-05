import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Components/Register/Register";
import Login from "./Components/Login/Login";
import HackathonDashboard from "./Pages/Admin_Dashboard/Admin_Dashboard";
import FacultyDashboard from "./Pages/Faculty_Dashboard/Faculty_dashboard";
import StudentDashboard from "./Pages/Student_Dashboard/Student_Dashboard";
import AllStudents from "./Pages/AllStudent/AllStudent";
import AllFaculty from "./Pages/AllFaculty/AllFaculty";
import CourseManagement from "./Pages/Course_Management/course"; // Import the course management component
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Dashboard */}
        <Route path="/admin" element={<HackathonDashboard />} />

        {/* Course Management */}
        <Route path="/course-management" element={<CourseManagement />} />

        {/* Faculty Dashboard */}
        <Route path="/faculty" element={<FacultyDashboard />} />

        {/* Student Dashboard */}
        <Route path="/student" element={<StudentDashboard />} />

        {/* Authentication Routes */}
        <Route path="user/login" element={<Login />} />
        <Route path="/" element={<Register />} />
        <Route path="/user/signup" element={<Register />} />

        {/* Additional Pages */}
        <Route path="/students" element={<AllStudents />} />
        <Route path="/faculty/all" element={<AllFaculty />} />
      </Routes>
    </Router>
  );
}

export default App;
