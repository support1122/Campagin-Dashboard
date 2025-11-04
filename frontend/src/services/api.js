import axios from 'axios'

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

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

// WhatsApp Campaign APIs
export const sendWhatsAppCampaign = async (data) => {
  const response = await api.post('/whatsapp/campaigns/send_message/', data)
  return response.data
}

export const getWhatsAppTemplates = async () => {
  const response = await api.get('/whatsapp/campaigns/templates/')
  return response.data
}

export const getWhatsAppCampaignLogs = async () => {
  const response = await api.get('/whatsapp/campaigns/logs/')
  return response.data
}

export const getWhatsAppContacts = async () => {
  const response = await api.get('/whatsapp/campaigns/contacts/')
  return response.data
}

export const sendWhatsAppNow = async (campaignId) => {
  const response = await api.post(`/whatsapp/campaigns/${campaignId}/send_now/`)
  return response.data
}

export const sendWhatsAppFollowup = async (campaignId, which) => {
  const response = await api.post(`/whatsapp/campaigns/${campaignId}/send_followup/`, { which })
  return response.data
}

export const cancelWhatsAppCampaign = async (campaignId, reason) => {
  const response = await api.post(`/whatsapp/campaigns/${campaignId}/cancel/`, reason ? { reason } : {})
  return response.data
}

export default api



