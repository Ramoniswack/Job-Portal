// API configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  register: `${API_URL}/api/users/register`,
  login: `${API_URL}/api/users/login`,
  
  // Job endpoints
  jobs: `${API_URL}/api/jobs`,
  myJobs: `${API_URL}/api/jobs/my-jobs`,
  jobById: (id: string) => `${API_URL}/api/jobs/${id}`,
  jobStatus: (id: string) => `${API_URL}/api/jobs/${id}/status`,
  
  // Application endpoints
  applications: `${API_URL}/api/applications`,
  myApplications: `${API_URL}/api/applications/my-applications`,
  applicationById: (id: string) => `${API_URL}/api/applications/${id}`,
  applicationStatus: (id: string) => `${API_URL}/api/applications/${id}/status`,
  jobApplications: (jobId: string) => `${API_URL}/api/applications/job/${jobId}`,
};
