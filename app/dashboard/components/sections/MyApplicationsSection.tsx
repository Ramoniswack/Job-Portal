'use client';

import { User, Application } from '../DashboardLayout';

interface MyApplicationsSectionProps {
    myApplications: Application[];
    currentUser: User | null;
    token: string;
    loadingApplications: boolean;
    onLoadApplications: () => void;
    onRefresh: () => void;
}

export default function MyApplicationsSection({
    myApplications,
    token,
    loadingApplications,
    onLoadApplications,
    onRefresh,
}: MyApplicationsSectionProps) {
    const cancelApplication = async (applicationId: string) => {
        if (!confirm('Are you sure you want to cancel this application?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/applications/${applicationId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            const data = await response.json();
            if (data.success) {
                alert('Application cancelled successfully!');
                onRefresh();
            } else {
                alert(data.message || 'Failed to cancel application');
            }
        } catch (error) {
            console.error('Error cancelling application:', error);
            alert('Error cancelling application');
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">My Applications</h2>
                    <p className="text-sm text-gray-500">Track your job applications and their status</p>
                </div>
                <button
                    onClick={onLoadApplications}
                    disabled={loadingApplications}
                    className="bg-[#26cf71] text-white px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
                >
                    {loadingApplications ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {myApplications.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {myApplications.map((application) => (
                                    <tr key={application._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{application.job.title}</div>
                                            <div className="text-sm text-gray-500">{application.job.location}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{application.job.category}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-[#26cf71]">${application.job.budget}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${application.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                                                application.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(application.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {application.status === 'requested' ? (
                                                <button
                                                    onClick={() => cancelApplication(application._id)}
                                                    className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-bold transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <span className="material-symbols-outlined text-gray-300 text-[64px]">description</span>
                        <p className="text-gray-500 mt-4">No applications found. Start applying for jobs!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

