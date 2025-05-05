import React, { useEffect, useState } from 'react';
import api from '../api/api';
import '../styles/InsightsViewer.css'; // Animations + styling

function InsightsViewer() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [insightSections, setInsightSections] = useState([]);

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

    const handleClassChange = async (e) => {
        const selectedId = e.target.value;
        setSelectedClassId(selectedId);

        const userId = localStorage.getItem('userId');

        try {
            const response = await api.get(`/api/classes/insights/${selectedId}/${userId}`);
            const html = response.data.insights || '<div>No insights available.</div>';
            const parsedSections = parseInsightHTML(html);
            setInsightSections(parsedSections);
        } catch (error) {
            console.error('Error fetching insights:', error);
            setInsightSections([{ title: 'Error', bullets: ['Failed to fetch insights.'] }]);
        }
    };

    const parseInsightHTML = (htmlString) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const sections = [];

        const headings = doc.querySelectorAll('h3');
        headings.forEach((h3) => {
            const title = h3.textContent;
            const bullets = [];
            let next = h3.nextElementSibling;
            while (next && next.tagName !== 'H3') {
                if (next.tagName === 'UL') {
                    next.querySelectorAll('li').forEach(li => {
                        bullets.push(li.textContent.trim());
                    });
                }
                next = next.nextElementSibling;
            }
            sections.push({ title, bullets });
        });

        return sections;
    };

    const getSectionClass = (title) => {
        if (title.includes('🏆')) return 'insight-achievement';
        if (title.includes('🔍')) return 'insight-focus';
        if (title.includes('🚀')) return 'insight-growth';
        return '';
    };

    if (loading) {
        return <div className="loading">Loading classes...</div>;
    }

    return (
        <div className="insights-viewer">
            <div className="insights-box">
                <select
                    value={selectedClassId}
                    onChange={handleClassChange}
                    className="category-select"
                >
                    <option value="" disabled>Select a Class</option>
                    {classes.map((classItem) => (
                        <option key={classItem._id} value={classItem._id}>
                            {classItem.title}
                        </option>
                    ))}
                </select>

                {insightSections.length > 0 && (
                    <div className="insight-section-container fade-in">
                        {insightSections.map((section, index) => (
                            <div key={index} className={`class-insight-card ${getSectionClass(section.title)}`}>
                                <h3 className="section-title">{section.title}</h3>
                                <ul className="section-bullets">
                                    {section.bullets.map((bullet, i) => (
                                        <li key={i}>{bullet}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default InsightsViewer;
