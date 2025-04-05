import React, { useEffect, useState } from 'react';
import './Student_dashboard.css';

const UserDashboard = ({ name }) => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);

    useEffect(() => {
        fetch("http://localhost:3000/student/all", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched courses:", data);
                setAllCourses(data.courses || []);
            })
            .catch((err) => console.error("Failed to fetch courses:", err));
    }, []);

    return (
        <div className="user-dashboard">
            <div className="sidebar">
                <h2>Panel</h2>
                <ul>
                    <li><a href="#">Assignment</a></li>
                    <li><a href="#">Notifications</a></li>
                    <li><a href="/profile">Profile</a></li>
                    <li><a href="/logout">Logout</a></li>
                </ul>
            </div>

            <div className="main-content">
                <div className="header">
                    <h1 className='welcome'>Welcome Back!, {name}</h1>
                </div>

                <div className="dashboard-section">
                    <h2>Enrolled Courses</h2>
                    <div className="hackathon-list">
                        {enrolledCourses.map((course, index) => (
                            <div className="hackathon-card" key={index}>
                                <h3>{course.name}</h3>
                                <p>Ends: {course.endDate}</p>
                                <a href={`/details/${course.name}`}><button>View Details</button></a>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>All Courses</h2>
                    <div className="courses-grid">
                        {allCourses.map((course, index) => (
                            <div className="course-card" key={index}>
                                <h3>{course.name}</h3>
                                <p>{course.description}</p>
                                <p>Instructor: {course.instructor}</p>
                                <p>Ends: {course.endDate}</p>
                                <a href={`/course/${course._id}`}>
                                    <button>View Details</button>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2>Assignment Submission</h2>
                    <p className="statusp">Status: <span className="status statusp">Pending</span></p>
                    <button>Submit Now</button>
                </div>

                <div className="dashboard-section">
                    <h2>Notifications</h2>
                    <ul className="notifications">
                        <li>AI Challenge Deadline Extended!</li>
                        <li>New leaderboard rankings are out!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
