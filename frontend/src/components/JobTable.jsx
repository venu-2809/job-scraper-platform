import React from 'react';
import api from '../services/api';

const JobTable = ({ jobs }) => {
    
    const handleApply = async (job) => {
        try {
            await api.post('/apply-job', {
                job_title: job.title,
                company: job.company,
                platform: job.platform,
                job_link: job.job_link
            });
            window.open(job.job_link, '_blank');
        } catch (error) {
            console.error('Failed to apply:', error);
            alert('Failed to record application. Still opening link.');
            window.open(job.job_link, '_blank');
        }
    };

    if (jobs.length === 0) return <p className="text-gray-500 mt-4 text-center bg-white p-8 rounded-xl shadow-lg">No jobs found. Try searching!</p>;

    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
            <table className="min-w-full text-left">
                <thead className="bg-gradient-to-r from-slate-600 to-blue-600 text-white">
                    <tr>
                        <th className="px-6 py-4 font-medium">Job Title</th>
                        <th className="px-6 py-4 font-medium">Company</th>
                        <th className="px-6 py-4 font-medium">Location</th>
                        <th className="px-6 py-4 font-medium">Platform</th>
                        <th className="px-6 py-4 font-medium">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job, idx) => (
                        <tr key={idx} className="border-b hover:bg-indigo-50 transition duration-150">
                            <td className="px-6 py-4 font-medium text-gray-900">{job.title}</td>
                            <td className="px-6 py-4 text-gray-700">{job.company}</td>
                            <td className="px-6 py-4 text-gray-700">{job.location}</td>
                            <td className="px-6 py-4 text-gray-700">{job.platform}</td>
                            <td className="px-6 py-4">
                                <button 
                                    onClick={() => handleApply(job)} 
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200 font-medium"
                                >
                                    Apply
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default JobTable;
