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

    useEffect(() => {
        fetchFeedback();
    }, [searchTerm, ordering]);

    const fetchFeedback = () => {
        axios.get(`http://localhost:8000/api/feedback/?search=${searchTerm}&ordering=${ordering}`)
            .then(res => {
                setFeedbackList(res.data);
            })
            .catch(err => {
                console.log(err);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8000/api/feedback/', { name, email, feedback })
            .then(res => {
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
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button onClick={clearSearch}>Clear</button>
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
                        {feedbackList.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.email}</td>
                                <td title={item.feedback} className="truncated-feedback">{truncateFeedback(item.feedback)}</td>
                                <td>{new Date(item.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default App;