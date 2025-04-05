import React from 'react';
import './Faculty_Dashboard.css';

const JudgingDashboard = ({ projects = [] }) => {
    return (
        <div className="judging-dashboard  layout-container">
            <nav className="sidebar">
                <h2>Faculty_Dashboard</h2>
                <ul>
                    <li className="active"><a href="#" className="active">Dashboard</a></li>
                    <li><a href="/allSubmission">Submissions</a></li>
                    <li><a href="#">Scoreboard</a></li>
                    <li><a href="#">Final Decisions</a></li>
                    <li><a href="/logout">Logout</a></li>
                </ul>
            </nav>

            <div className="main-content">
                <header>
                    <h1 className='welcome'>Welcome, Faculty!</h1>
                    <button className="logout-btn">Logout</button>
                </header>

                <section className="judging-section">
                    <h2 className='pending'>All Courses</h2>
                    {projects.map((project, index) => (
                        <div className="submission-card" key={index}>
                            <h3>{project.team}</h3>
                            <h3>{project.hackathon}</h3>
                            <p>{project.title}</p>
                            <a href={`/viewScore?team=${project.team}&hackathon=${project.hackathon}`}>
                                <button>View & Score</button>
                            </a>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
};

export default JudgingDashboard;
