import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [feedbackList, setFeedbackList] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [ordering, setOrdering] = useState('');
    const [currentSortField, setCurrentSortField] = useState(''); // Stores the field currently sorted
    const [sortDirection, setSortDirection] = useState(''); // 'asc' or 'desc'
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({
        count: 0,
        next: null,
        previous: null
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFeedback();
    }, [searchTerm, ordering, currentPage]);

    const fetchFeedback = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (ordering) params.append('ordering', ordering);
        if (currentPage > 1) params.append('page', currentPage);

        axios.get(`http://localhost:8000/api/feedback/?${params.toString()}`)
            .then(res => {
                // Handle paginated response
                if (res.data.results) {
                    setFeedbackList(res.data.results);
                    setPaginationInfo({
                        count: res.data.count,
                        next: res.data.next,
                        previous: res.data.previous
                    });
                } else {
                    // Fallback for non-paginated response
                    setFeedbackList(res.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8000/api/feedback/', { name, email, feedback })
            .then(res => {
                // Reset to first page and refresh
                setCurrentPage(1);
                fetchFeedback();
                setName('');
                setEmail('');
                setFeedback('');
            })
            .catch(err => {
                console.log(err);
            });
    };

    const handleSort = (field) => {
        let newOrdering;
        let newDirection;

        if (currentSortField === field) {
            if (sortDirection === 'asc') {
                newOrdering = `-${field}`;
                newDirection = 'desc';
            } else {
                newOrdering = ''; // Clear sort
                newDirection = '';
            }
        } else {
            newOrdering = field;
            newDirection = 'asc';
        }

        setOrdering(newOrdering);
        setCurrentSortField(newDirection ? field : '');
        setSortDirection(newDirection);
    };

    const getSortIndicator = (field) => {
        let indicator = ' ↕'; // Default grey indicator
        let className = 'sort-indicator default';

        if (currentSortField === field) {
            indicator = sortDirection === 'asc' ? ' ▲' : ' ▼';
            className = 'sort-indicator active';
        }
        return <span className={className}>{indicator}</span>;
    };

    const clearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // Scroll to top of table
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getTotalPages = () => {
        return Math.ceil(paginationInfo.count / 10);
    };

    const truncateFeedback = (text, maxLines = 3) => {
        const lines = text.split('\n');
        if (lines.length > maxLines) {
            return lines.slice(0, maxLines).join('\n') + '...';
        }
        return text;
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Feedback App</h1>
            </header>
            <div className="feedback-form">
                <h2>Submit Feedback</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        required
                    ></textarea>
                    <button type="submit">Submit</button>
                </form>
            </div>
            <div className="feedback-list">
                <h2>Submitted Feedback</h2>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <button onClick={clearSearch}>Clear</button>
                </div>
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        <div className="pagination-info">
                            Showing {feedbackList.length > 0 ? ((currentPage - 1) * 10 + 1) : 0} to {Math.min(currentPage * 10, paginationInfo.count)} of {paginationInfo.count} entries
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th className={`sortable ${currentSortField === 'name' ? 'active-sort' : ''}`} onClick={() => handleSort('name')}>Name {getSortIndicator('name')}</th>
                                    <th className={`sortable ${currentSortField === 'email' ? 'active-sort' : ''}`} onClick={() => handleSort('email')}>Email {getSortIndicator('email')}</th>
                                    <th>Feedback</th> {/* Feedback is not sortable by default */} 
                                    <th className={`sortable ${currentSortField === 'created_at' ? 'active-sort' : ''}`} onClick={() => handleSort('created_at')}>Date {getSortIndicator('created_at')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {feedbackList.length > 0 ? (
                                    feedbackList.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.name}</td>
                                            <td>{item.email}</td>
                                            <td title={item.feedback} className="truncated-feedback">{truncateFeedback(item.feedback)}</td>
                                            <td>{new Date(item.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="no-results">No feedback found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {paginationInfo.count > 0 && (
                            <div className="pagination-controls">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)} 
                                    disabled={!paginationInfo.previous}
                                    className="pagination-btn"
                                >
                                    Previous
                                </button>
                                <div className="page-numbers">
                                    {Array.from({ length: getTotalPages() }, (_, i) => i + 1)
                                        .filter(page => {
                                            // Show first page, last page, current page, and pages around current
                                            return page === 1 || 
                                                   page === getTotalPages() || 
                                                   (page >= currentPage - 1 && page <= currentPage + 1);
                                        })
                                        .map((page, index, array) => {
                                            // Add ellipsis if there's a gap
                                            const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                                            return (
                                                <React.Fragment key={page}>
                                                    {showEllipsisBefore && <span className="ellipsis">...</span>}
                                                    <button
                                                        onClick={() => handlePageChange(page)}
                                                        className={`page-number ${currentPage === page ? 'active' : ''}`}
                                                    >
                                                        {page}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })}
                                </div>
                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)} 
                                    disabled={!paginationInfo.next}
                                    className="pagination-btn"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default App;