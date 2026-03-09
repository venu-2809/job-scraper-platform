import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import JobTable from '../components/JobTable';
import api from '../services/api';

const Dashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [insights, setInsights] = useState(null);
    const [insightsError, setInsightsError] = useState('');
    const [isInsightsLoading, setIsInsightsLoading] = useState(false);

    const handleSearch = async ({ keyword, location }) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.post('/scrape-jobs', { keyword, location });
            setJobs(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to fetch jobs');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInsights = async () => {
        if (!resumeText.trim()) {
            setInsightsError('Please paste your resume text first.');
            return;
        }
        if (!jobs.length) {
            setInsightsError('Please scrape some jobs first so we can analyze them.');
            return;
        }
        setIsInsightsLoading(true);
        setInsightsError('');
        try {
            const response = await api.post('/resume-insights', {
                resume_text: resumeText,
                jobs,
            });
            setInsights(response.data);
        } catch (err) {
            setInsightsError(err.response?.data?.detail || 'Failed to generate insights');
        } finally {
            setIsInsightsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">Job Scraper Dashboard</h1>
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <SearchBar onSearch={handleSearch} isLoading={isLoading} />
                    {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                </div>
                <JobTable jobs={jobs} />

                <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">AI Resume Insights</h2>
                    <p className="text-sm text-gray-600 mb-3">
                        Paste your resume text below. We&apos;ll analyze the scraped job titles and platforms to
                        highlight important keywords that are missing from your resume.
                    </p>
                    <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 h-40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3 resize-none"
                        placeholder="Paste your resume here..."
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={handleInsights}
                        disabled={isInsightsLoading}
                        className="bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-slate-700 disabled:from-slate-400 disabled:to-slate-500 text-white px-6 py-2 rounded-lg transition duration-200 font-medium transform hover:scale-105 disabled:transform-none"
                    >
                        {isInsightsLoading ? 'Analyzing...' : 'Get Resume Insights'}
                    </button>
                    {insightsError && <p className="text-red-500 mt-3">{insightsError}</p>}
                    {insights && (
                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 text-gray-800 text-lg">Recommended Keywords</h3>
                                {insights.recommended_keywords?.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {insights.recommended_keywords.map((kw) => (
                                            <span key={kw} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">No additional keywords recommended.</p>
                                )}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold mb-3 text-gray-800 text-lg">Top Skills in Jobs</h3>
                                {insights.top_job_skills?.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {insights.top_job_skills.map((kw) => (
                                            <span key={kw} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">No skills extracted from current results.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
