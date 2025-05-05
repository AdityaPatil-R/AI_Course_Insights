import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles/CreateClassForm.css';

function CreateClassForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId'); // ✅ Get userId
        if (!userId) {
            alert('You must be logged in!');
            return;
        }

        try {
            await api.post('/api/classes/create', { title, description, userId }); // ✅ Send userId
            alert('Class created successfully!');
            setTitle('');
            setDescription('');
            navigate('/upload'); // ✅ Redirect to upload page
        } catch (error) {
            console.error('Error creating class:', error);
            alert('Failed to create class.');
        }
    };

    return (
        <form className="create-class-form" onSubmit={handleSubmit}>
            <input
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
            <input
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
            />
            <button type="submit">Add Class</button>
        </form>
    );
}

export default CreateClassForm;
