import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AllStudent.css'

const AllStudents = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 10;

    useEffect(() => {
        axios.get(`http://localhost:3000/admin/allStudentss/${currentPage}`)
            .then(res => {
                setStudents(res.data.students);
                setFilteredStudents(res.data.students);
            }).catch(err => {
                console.log(err);
            });
    }, [currentPage]);

    useEffect(() => {
        const filtered = students.filter(student =>
            (student.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             student.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        console.log('students:', students);        
        setFilteredStudents(filtered);
        setCurrentPage(1); // Reset to first page on search
    }, [searchQuery, students]);

    const indexOfLast = currentPage * studentsPerPage;
    const indexOfFirst = indexOfLast - studentsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

    return (
        <div className="students-container">
            <h2>All Students</h2>

            <input
                type="text"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-bar"
            />

            <table className="students-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {currentStudents.map((student, index) => (
                        <tr key={index}>
                            <td>{student.userName}</td>
                            <td>{student.email}</td>
                            <td>{student.role}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button className='btnssw' onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    Prev
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default AllStudents;
