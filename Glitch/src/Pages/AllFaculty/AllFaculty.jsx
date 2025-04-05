import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AllFaculty.css';

const AllFaculty = () => {
    const [faculties, setFaculties] = useState([]);
    const [filteredFaculties, setFilteredFaculties] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const facultiesPerPage = 10;

    useEffect(() => {
        axios.get(`http://localhost:3000/admin/allFacultyss/${currentPage}`)
            .then(res => {
                setFaculties(res.data.faculties);
                setFilteredFaculties(res.data.faculties);
            }).catch(err => {
                console.log(err);
            });
    }, [currentPage]);

    useEffect(() => {
        const filtered = faculties.filter(faculty =>
            (faculty.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             faculty.email?.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredFaculties(filtered);
        setCurrentPage(1); // Reset to first page on search
    }, [searchQuery, faculties]);

    const indexOfLast = currentPage * facultiesPerPage;
    const indexOfFirst = indexOfLast - facultiesPerPage;
    const currentFaculties = filteredFaculties.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(filteredFaculties.length / facultiesPerPage);

    return (
        <div className="faculty-container">
            <h2>All Faculties</h2>

            <input
                type="text"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-bar"
            />

            <table className="faculty-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                    </tr>
                </thead>
                <tbody>
                    {currentFaculties.map((faculty, index) => (
                        <tr key={index}>
                            <td>{faculty.userName || 'N/A'}</td>
                            <td>{faculty.email || 'N/A'}</td>
                            <td>{faculty.role || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
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

export default AllFaculty;
