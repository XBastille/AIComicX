import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './course.css';
import ReactMarkdown from 'react-markdown'; 


const mockAPI = {
  getCourses: () => {
    const courses = localStorage.getItem('courses');
    return courses ? JSON.parse(courses) : [];
  },
  
  addCourse: (course) => {
    const courses = mockAPI.getCourses();
    const updatedCourses = [...courses, course];
    localStorage.setItem('courses', JSON.stringify(updatedCourses));
    return { success: true, course };
  },
  
  updateCourse: (id, updatedCourse) => {
    const courses = mockAPI.getCourses();
    const index = courses.findIndex(course => course.id === id);
    
    if (index !== -1) {
      courses[index] = { ...courses[index], ...updatedCourse };
      localStorage.setItem('courses', JSON.stringify(courses));
      return { success: true, course: courses[index] };
    }
    
    return { success: false, message: 'Course not found' };
  }
};

const CourseManagement = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [hoveredInfoBtn, setHoveredInfoBtn] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [viewingCourse, setViewingCourse] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({
        courseName: '',
        description: '',
        content: ''
    });
    
    useEffect(() => {
        fetchCourses();
    }, []);
    
    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const data = mockAPI.getCourses();
            console.log('Fetched courses data:', data);
            setCourses(data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            if (editingCourse) {
                const updatedCourse = {
                    ...editingCourse,
                    courseName: formData.courseName,
                    description: formData.description,
                    content: formData.content,
                    updatedAt: new Date().toISOString()
                };
                
                const response = mockAPI.updateCourse(editingCourse.id, updatedCourse);
                
                if (response.success) {
                    setCourses(prevCourses => 
                        prevCourses.map(course => 
                            course.id === editingCourse.id ? updatedCourse : course
                        )
                    );
                    
                    alert('Course updated successfully!');
                }
            } else {
                const courseData = {
                    id: Date.now(),
                    courseName: formData.courseName,
                    description: formData.description,
                    content: formData.content,
                    price: 0,
                    createdAt: new Date().toISOString()
                };
                
                console.log('Submitting course data:', courseData);
                
                const response = mockAPI.addCourse(courseData);
                console.log('Course creation response:', response);
                
                setCourses(prevCourses => [...prevCourses, courseData]);
                
                alert('Course added successfully!');
            }
            
            resetForm();
            
        } catch (error) {
            console.error('Error with course:', error);
            alert('Failed to process course. Please check console for details.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetForm = () => {
        setFormData({
            courseName: '',
            description: '',
            content: ''
        });
        setShowCreateForm(false);
        setEditingCourse(null);
    };
    
    const toggleCreateForm = () => {
        if (showCreateForm) {
            resetForm();
        } else {
            setViewingCourse(null);
            setShowCreateForm(true);
        }
    };
    
    const handleCourseClick = (course) => {
        console.log('Clicked on course:', course);
        setViewingCourse(course);
        setShowCreateForm(false);
        setEditingCourse(null);
    };
    
    const handleEditClick = (e, course) => {
        e.stopPropagation();
        setFormData({
            courseName: course.courseName,
            description: course.description,
            content: course.content
        });
        setEditingCourse(course);
        setShowCreateForm(true);
        setViewingCourse(null);
    };
    
    const handleInfoBtnMouseEnter = (e, index) => {
        e.stopPropagation();
        setHoveredInfoBtn(index);
    };
    
    const handleInfoBtnMouseLeave = (e) => {
        e.stopPropagation();
        setHoveredInfoBtn(null);
    };
    
    const handleCloseDetail = () => {
        setViewingCourse(null);
    };
    
    return (
        <div className="course-management">
            <div className="sidebar">
                <div className="sidebar-logo">
                    <h1 className='adminssss'>Admin</h1>
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="/admin">Dashboard</Link></li>
                    <li><a href="#" className="active">Manage Courses</a></li>
                    <li><a href="#">All Student</a></li>
                    <li><a href="#">All Faculty</a></li>
                    <li><a href="#">Profile</a></li>
                    <li><a href="#">Logout</a></li>
                </ul>
            </div>
            
            <div className="main-content">
                <div className="course-header">
                    <h2 className="main_header">Course Management</h2>
                    <div className="course-actions">
                        <button className="btn" onClick={toggleCreateForm} disabled={isLoading}>
                            {showCreateForm ? 'Cancel' : 'Create Course'}
                        </button>
                    </div>
                </div>
                
                {showCreateForm && (
                    <div className="create-course-form">
                        <h3 className="form-title">
                            {editingCourse ? 'Edit Course' : 'Create New Course'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="courseName">Course Name</label>
                                <input
                                    type="text"
                                    id="courseName"
                                    name="courseName"
                                    value={formData.courseName}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter course name"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="description">Course Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Brief description of the course"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="content">
                                    Course Content 
                                    <span className="markdown-note">
                                        (Supports Markdown & LaTeX equations)
                                    </span>
                                </label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    required
                                    className="content-textarea"
                                    placeholder="# Course Module 1
## Topic 1.1
This is a paragraph with **bold** and *italic* text.

For math equations use LaTeX syntax:
$E = mc^2$

## Topic 1.2
- Bullet point 1
- Bullet point 2

```code example```"
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button type="submit" className="btn" disabled={isLoading}>
                                    {isLoading 
                                        ? (editingCourse ? "Updating..." : "Adding...") 
                                        : (editingCourse ? "Update Course" : "Add Course")
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                
                {viewingCourse && (
                    <div className="course-detail-view">
                        <div className="detail-header">
                            <h3 className="detail-title">{viewingCourse.courseName}</h3>
                            <button className="btn-close" onClick={handleCloseDetail}>×</button>
                        </div>
                        <div className="detail-description">
                            <h4>Description</h4>
                            <p>{viewingCourse.description}</p>
                        </div>
                        <div className="detail-content">
                            <h4>Content</h4>
                            <div className="markdown-content">
                                <ReactMarkdown>{viewingCourse.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
                
                {!showCreateForm && !viewingCourse && (
                    <div className="courses-list">
                        <h3 className="section-title">All Courses {isLoading && "(Loading...)"}</h3>
                        
                        {isLoading && !courses.length ? (
                            <div className="loading-state">
                                <p>Loading courses...</p>
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="empty-state">
                                <p>No courses available yet. Create your first course!</p>
                            </div>
                        ) : (
                            <div className="course-grid">
                                {courses.map((course, index) => (
                                    <div 
                                        className="course-tile" 
                                        key={index}
                                        onClick={() => handleCourseClick(course)}
                                    >
                                        <div className="course-tile-inner">
                                            <div className="course-name-display">
                                                {course.courseName}
                                            </div>
                                            <div className="course-actions-overlay">
                                                <button 
                                                    className="info-btn"
                                                    onMouseEnter={(e) => handleInfoBtnMouseEnter(e, index)}
                                                    onMouseLeave={handleInfoBtnMouseLeave}
                                                >
                                                    i
                                                    {hoveredInfoBtn === index && (
                                                        <div className="course-hover-info">
                                                            <h4>{course.courseName}</h4>
                                                            <p>{course.description?.substring(0, 100)}...</p>
                                                        </div>
                                                    )}
                                                </button>
                                                <button 
                                                    className="edit-btn"
                                                    onClick={(e) => handleEditClick(e, course)}
                                                >
                                                    ✎
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseManagement;