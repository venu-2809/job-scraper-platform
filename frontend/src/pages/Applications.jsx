import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Applications = () => {
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await api.get('/applications');
                setApplications(res.data);
            } catch (err) {
                console.error("Failed to load applications:", err);
            }
        };
        fetchApps();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">My Applications</h1>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 font-medium text-gray-500">Job Title</th>
                            <th className="px-6 py-3 font-medium text-gray-500">Company</th>
                            <th className="px-6 py-3 font-medium text-gray-500">Platform</th>
                            <th className="px-6 py-3 font-medium text-gray-500">Date Applied</th>
                            <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No applications yet. Start applying from the dashboard!</td>
                            </tr>
                        )}
                        {applications.map(app => (
                            <tr key={app.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-blue-600">
                                    <a href={app.job_link} target="_blank" rel="noreferrer" className="hover:underline">
                                        {app.job_title}
                                    </a>
                                </td>
                                <td className="px-6 py-4">{app.company}</td>
                                <td className="px-6 py-4">{app.platform}</td>
                                <td className="px-6 py-4">{new Date(app.applied_date).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                        {app.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Applications;
