import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { MdSend, MdRefresh } from 'react-icons/md'
import { sendEmailCampaign, getCampaignLogs } from '../services/api'
import CampaignLogs from './CampaignLogs'

const EmailMarketing = () => {
  const [formData, setFormData] = useState({
    domain_name: '',
    template_name: '',
    template_id: '',
    recipients: ''
  })
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)

  // Fetch logs on component mount
  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLogsLoading(true)
    try {
      const response = await getCampaignLogs()
      if (response.success) {
        setLogs(response.data)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Failed to fetch campaign logs')
    } finally {
      setLogsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.domain_name || !formData.template_name || !formData.template_id || !formData.recipients) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const response = await sendEmailCampaign(formData)

      if (response.success) {
        toast.success(
          `Campaign sent! ${response.data.successful}/${response.data.total} emails delivered successfully`
        )
        
        // Reset form
        setFormData({
          domain_name: '',
          template_name: '',
          template_id: '',
          recipients: ''
        })

        // Refresh logs
        fetchLogs()
      } else {
        toast.error(response.error || 'Failed to send campaign')
      }
    } catch (error) {
      console.error('Error sending campaign:', error)
      toast.error(error.response?.data?.error || 'Failed to send campaign. Please check your SendGrid configuration.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Email Marketing</h1>
        <p className="text-gray-600 mt-2">Send template emails using SendGrid</p>
      </div>

      {/* Email Form */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Send Campaign</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Domain Name */}
          <div>
            <label htmlFor="domain_name" className="block text-sm font-medium text-gray-700 mb-2">
              Domain Name
            </label>
            <input
              type="text"
              id="domain_name"
              name="domain_name"
              value={formData.domain_name}
              onChange={handleChange}
              placeholder="e.g., example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Template Name */}
          <div>
            <label htmlFor="template_name" className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              id="template_name"
              name="template_name"
              value={formData.template_name}
              onChange={handleChange}
              placeholder="e.g., Welcome Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Template ID */}
          <div>
            <label htmlFor="template_id" className="block text-sm font-medium text-gray-700 mb-2">
              Template ID
            </label>
            <input
              type="text"
              id="template_id"
              name="template_id"
              value={formData.template_id}
              onChange={handleChange}
              placeholder="e.g., d-1234567890abcdef"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Email Recipients */}
          <div>
            <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 mb-2">
              Email IDs (Recipients)
            </label>
            <textarea
              id="recipients"
              name="recipients"
              value={formData.recipients}
              onChange={handleChange}
              rows="4"
              placeholder="e.g., email1@example.com, email2@example.com, email3@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
            />
            <p className="mt-2 text-sm text-gray-500">Separate multiple email addresses with commas</p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className={`
                flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white
                transition-all duration-200 shadow-md
                ${loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 hover:shadow-lg'
                }
              `}
            >
              <MdSend className="text-xl" />
              {loading ? 'Sending...' : 'Hit - Send Campaign'}
            </button>
          </div>
        </form>
      </div>

      {/* Campaign Logs */}
      <CampaignLogs 
        logs={logs} 
        loading={logsLoading} 
        onRefresh={fetchLogs}
      />
    </div>
  )
}

export default EmailMarketing



