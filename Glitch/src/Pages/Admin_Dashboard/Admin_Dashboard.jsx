import { React, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Admin_Dashboard.css'
import { windowlistner } from '../../Components/WindowListener/WindowListener';
import axios from 'axios'

const HackathonDashboard = ({
    ongoingHackathonscount,
    upcomingHackathonscount,
    ongoingHackathons = [],
    upcomingHackathons = [],
}) => {
    const navigate = useNavigate();
    const [position, setposition] = useState({ x: 0, y: 0 });
    
    windowlistner('pointermove', (e) => {
        setposition({ x: e.clientX, y: e.clientY })
    })

    const handleManageCourses = () => {
        navigate('/course-management');
    };

    return (
        <div className="dashboard">
            <div className="cursor" style={{
                ...styles.cursor,
                transform: `translate(${position.x}px, ${position.y}px)`
            }}></div>
            <div className="sidebar">
                <div className="sidebar-logo">
                    <h1 className='adminssss'>Admin</h1>
                </div>
                <ul className="sidebar-menu">
                    <li><a href='#' className="active">Dashboard</a></li>
                    <li><a href='#'>All Student</a></li>
                    <li><a href='#'>All Faculty</a></li>
                    <li><a href='#'>Profile</a></li>
                    <li><a href='#'>Logout</a></li>
                </ul>
            </div>

            <div className="main-content">
                <div className="dashboard-header">
                    <h2 className='main_header'>Admin Dashboard</h2>
                    <div className="quick-actions">
                        <button className="btn btn-secondary" onClick={handleManageCourses}>Manage Course</button>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-value">{ongoingHackathonscount}</div>
                        <div className="stat-card-label">Active Batches</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-value">{upcomingHackathonscount}</div>
                        <div className="stat-card-label">Upcoming Batches</div>
                    </div>
                </div>

                <div className="hackathons-section">
                    <div className="hackathons-list">
                        <h3 className="upcome">Upcoming Batches</h3>
                        {upcomingHackathons.map((hackathon, index) => (
                            <div className="hackathon-item" key={index}>
                                <div className="hackathon-details">
                                    <span className="hackathon-name">{hackathon.Name}</span>
                                    <span className="hackathon-date">{hackathon.StartDate}</span>
                                </div>
                                <span className="hackathon-status status-upcoming">Upcoming</span>
                            </div>
                        ))}
                    </div>

                    <br />

                    <div className="hackathons-list">
                        <h3 className="upcome">Ongoing Batches</h3>
                        {ongoingHackathons.map((hackathon, index) => (
                            <div className="hackathon-item" key={index}>
                                <div className="hackathon-details">
                                    <span className="hackathon-name">{hackathon.Name}</span>
                                    <span className="hackathon-date">{hackathon.StartDate}</span>
                                </div>
                                <span className="hackathon-status status-upcoming">Ongoing</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    cursor: {
        transition: "transform 0.18s ease",
        height: '60px',
        width: '60px',
        borderRadius: '50px',
        position: 'fixed',
        border: "1px solid white",
        pointerEvents: "none",
        left: -30,
        top: -30,
        zIndex: 9999,
        opacity: '0.9',
    },
}

export default HackathonDashboard;