import axios from 'axios'

// FIXED: Use the correct backend URL from Render deployment
// The correct backend URL is: https://campagin-dashboard.onrender.com
const API_BASE_URL = 'https://campagin-dashboard.onrender.com/api'

// Override any environment variable that might be wrong
console.log('Using API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add timeout
})

// Email Campaign APIs
export const sendEmailCampaign = async (data) => {
  const response = await api.post('/emails/campaigns/send_email/', data)
  return response.data
}

export const getCampaignLogs = async () => {
  const response = await api.get('/emails/campaigns/logs/')
  return response.data
}

export default api



