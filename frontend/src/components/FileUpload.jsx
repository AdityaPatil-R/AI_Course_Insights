import React, { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles/FileUpload.css';

function FileUpload() {
    const [file, setFile] = useState(null);
    const [category, setCategory] = useState('');
    const [className, setClassName] = useState('');
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClasses = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                alert('Please log in first!');
                return;
            }
            try {
                const response = await api.get(`/api/classes/all/${userId}`);
                setClasses(response.data);
            } catch (error) {
                console.error('Error fetching classes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleClassChange = (e) => {
        setClassName(e.target.value);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !className || !category) {
            alert("Please select a file, a category, and choose a class.");
            return;
        }

        try {
            const selectedClass = classes.find(cls => cls.title === className);
            if (!selectedClass) {
                alert("Selected class not found!");
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', category);
            formData.append('classId', selectedClass._id);
            formData.append('userId', localStorage.getItem('userId')); // 👈 add this

            const response = await api.post('/api/classes/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 200) {
                alert('File uploaded and insights generated!');
                setFile(null);
                setCategory('');
                setClassName('');
            } else {
                alert('Failed to upload file.');
            }
        } catch (error) {
            console.error('Upload error:', error.response?.data || error.message);
            alert('Failed to upload file.');
        }
    };

    if (loading) {
        return <div>Loading classes...</div>;
    }

    return (
        <div className="file-upload-form">
            <form onSubmit={handleUpload}>
                <label htmlFor="file-upload" className="custom-file-upload">
                    {file ? file.name : "Choose File"}
                </label>
                <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                />

                <select
                    value={className}
                    onChange={handleClassChange}
                    className="category-select"
                >
                    <option value="" disabled>Select a Class</option>
                    {classes.map((cls) => (
                        <option key={cls._id} value={cls.title}>
                            {cls.title}
                        </option>
                    ))}
                </select>

                <select value={category} onChange={e => setCategory(e.target.value)} className="category-select">
                    <option value="" disabled>Select a Category</option>
                    <option value="homework">Homework</option>
                    <option value="quiz">Quiz</option>
                    <option value="test">Test</option>
                </select>

                <button type="submit" className="upload-button">Upload</button>
            </form>
        </div>
    );
}

export default FileUpload;
