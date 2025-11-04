import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { MdSend, MdRefresh } from 'react-icons/md'
import { sendWhatsAppCampaign, getWhatsAppTemplates, getWhatsAppCampaignLogs, getWhatsAppContacts } from '../services/api'
import WhatsAppCampaignLogs from './WhatsAppCampaignLogs'

const WhatsAppMarketing = () => {
  const [formData, setFormData] = useState({
    template_name: '',
    template_id: '',
    mobile_number: '',
    scheduled_time: ''
  })
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [templates, setTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [contacts, setContacts] = useState([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState([])
  const [manualNumber, setManualNumber] = useState('')
  const [param1, setParam1] = useState('https://flashfirejobs.com/pricing')
  const [param2, setParam2] = useState('https://flashfirejobs.com/pricing')

  // Fetch templates, contacts, and logs on component mount
  useEffect(() => {
    fetchTemplates()
    fetchContacts()
    fetchLogs()
  }, [])

  const fetchTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const response = await getWhatsAppTemplates()
      if (response.success) {
        setTemplates(response.data)
        // Set default template if available
        if (response.data.length > 0 && !formData.template_name) {
          const firstTemplate = response.data[0]
          setFormData(prev => ({
            ...prev,
            template_name: firstTemplate.name,
            template_id: firstTemplate.id
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to fetch WhatsApp templates')
    } finally {
      setLoadingTemplates(false)
    }
  }

  const fetchContacts = async () => {
    setLoadingContacts(true)
    try {
      const response = await getWhatsAppContacts()
      if (response.success) {
        setContacts(response.data)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
      toast.error('Failed to fetch WhatsApp contacts')
    } finally {
      setLoadingContacts(false)
    }
  }

  const fetchLogs = async () => {
    setLogsLoading(true)
    try {
      const response = await getWhatsAppCampaignLogs()
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

  const handleContactToggle = (contactPhone) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactPhone)) {
        return prev.filter(phone => phone !== contactPhone)
      } else {
        return [...prev, contactPhone]
      }
    })
  }

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(contacts.map(c => c.phone))
    }
  }

  const handleTemplateChange = (e) => {
    const selectedTemplate = templates.find(t => t.name === e.target.value)
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        template_name: selectedTemplate.name,
        template_id: selectedTemplate.id
      }))
      // Reset parameters when template changes
      if (selectedTemplate.name !== 'payment112') {
        setParam1('https://flashfirejobs.com/pricing')
        setParam2('https://flashfirejobs.com/pricing')
      }
    }
  }

  // Check if payment112 template is selected
  const isPayment112Template = formData.template_name === 'payment112'

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.template_name || !formData.template_id || !formData.scheduled_time) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      const localDateTime = new Date(formData.scheduled_time)
      const scheduledTimeUTC = localDateTime.toISOString()
      
      const recipients = [...selectedContacts]
      if (manualNumber && manualNumber.trim()) {
        recipients.push(manualNumber.trim())
      }

      if (recipients.length === 0) {
        toast.error('Please select a contact or enter a number')
        setLoading(false)
        return
      }

      // Check if this is payment112 template - schedule 3 campaigns
      const isPayment112 = formData.template_name === 'payment112'
      
      // Prepare parameters for payment112 template
      const parameters = isPayment112 ? [
        { name: '2', value: param1 },
        { name: '3', value: param2 }
      ] : []

      // Send to all recipients
      let successCount = 0
      let failureCount = 0

      for (const contactPhone of recipients) {
        try {
          if (isPayment112) {
            // Schedule 3 campaigns: today, 7 days, 10 days
            const baseDate = new Date(scheduledTimeUTC)
            const schedules = [
              { days: 0, label: 'today' },
              { days: 7, label: '7 days' },
              { days: 10, label: '10 days' }
            ]

            for (const schedule of schedules) {
              const campaignDate = new Date(baseDate)
              campaignDate.setDate(campaignDate.getDate() + schedule.days)
              const campaignScheduledTime = campaignDate.toISOString()

              const campaignData = {
                template_name: formData.template_name,
                template_id: formData.template_id,
                mobile_number: contactPhone,
                scheduled_time: campaignScheduledTime,
                parameters: parameters
              }
              
              const response = await sendWhatsAppCampaign(campaignData)
              
              if (response.success) {
                successCount++
              } else {
                failureCount++
              }
            }
          } else {
            // Regular single campaign
            const campaignData = {
              template_name: formData.template_name,
              template_id: formData.template_id,
              mobile_number: contactPhone,
              scheduled_time: scheduledTimeUTC,
              parameters: parameters
            }
            
            const response = await sendWhatsAppCampaign(campaignData)
            
            if (response.success) {
              successCount++
            } else {
              failureCount++
            }
          }
        } catch (error) {
          console.error('Error sending to contact:', contactPhone, error)
          failureCount++
        }
      }

      // Show summary
      if (successCount > 0) {
        toast.success(`Successfully sent to ${successCount} contact(s)${failureCount > 0 ? `, ${failureCount} failed` : ''}`)
      } else {
        toast.error('Failed to send to all contacts')
      }
      
      // Reset form
      setFormData({
        template_name: templates.length > 0 ? templates[0].name : '',
        template_id: templates.length > 0 ? templates[0].id : '',
        mobile_number: '',
        scheduled_time: ''
      })
      setSelectedContacts([])
      setParam1('https://flashfirejobs.com/pricing')
      setParam2('https://flashfirejobs.com/pricing')

      // Refresh logs
      fetchLogs()
    } catch (error) {
      console.error('Error sending campaign:', error)
      toast.error(error.response?.data?.error || 'Failed to send campaign. Please check your WATI configuration.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">WhatsApp Marketing</h1>
        <p className="text-gray-600 mt-2">Send WhatsApp messages using WATI templates</p>
      </div>

      {/* WhatsApp Form */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Send Campaign</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Name - Dropdown */}
          <div>
            <label htmlFor="template_name" className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <select
              id="template_name"
              name="template_name"
              value={formData.template_name}
              onChange={handleTemplateChange}
              disabled={loadingTemplates || templates.length === 0}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              {loadingTemplates ? (
                <option>Loading templates...</option>
              ) : templates.length === 0 ? (
                <option>No templates available</option>
              ) : (
                templates.map((template) => (
                  <option key={template.id} value={template.name}>
                    {template.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Template ID (auto-filled) */}
          <div> 
            <label htmlFor="template_id" className="block text-sm font-medium text-gray-700 mb-2">
              Template ID
            </label>
            <input
              type="text"
              id="template_id"
              name="template_id"
              value={formData.template_id}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>

          {/* Parameter fields for payment112 template */}
          {isPayment112Template && (
            <>
              <div>
                <label htmlFor="param1" className="block text-sm font-medium text-gray-700 mb-2">
                  Parameter 1 (for {'{{'}2{'}}'})
                </label>
                <input
                  type="text"
                  id="param1"
                  name="param1"
                  value={param1}
                  onChange={(e) => setParam1(e.target.value)}
                  placeholder="https://flashfirejobs.com/pricing"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <p className="mt-2 text-sm text-gray-500">This value will replace {'{{'}2{'}}'} in the template</p>
              </div>

              <div>
                <label htmlFor="param2" className="block text-sm font-medium text-gray-700 mb-2">
                  Parameter 2 (for {'{{'}3{'}}'})
                </label>
                <input
                  type="text"
                  id="param2"
                  name="param2"
                  value={param2}
                  onChange={(e) => setParam2(e.target.value)}
                  placeholder="https://flashfirejobs.com/pricing"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <p className="mt-2 text-sm text-gray-500">This value will replace {'{{'}3{'}}'} in the template</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This template will automatically schedule 3 campaigns:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>One for today (scheduled time)</li>
                    <li>One for 7 days later</li>
                    <li>One for 10 days later</li>
                  </ul>
                </p>
              </div>
            </>
          )}

          {/* Contacts Selection */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="contacts" className="block text-sm font-medium text-gray-700">
                Select Contacts
              </label>
              {contacts.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllContacts}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            {loadingContacts ? (
              <div className="text-center py-4 text-gray-500">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No contacts available</div>
            ) : (
              <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                {contacts.map((contact) => (
                  <label
                    key={contact.phone}
                    className="flex items-center px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.phone)}
                      onChange={() => handleContactToggle(contact.phone)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.phone}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {selectedContacts.length > 0 ? `${selectedContacts.length} contact(s) selected` : 'Select one or more contacts'}
            </p>
          </div>

          {/* Manual Number (optional) */}
          <div>
            <label htmlFor="manualNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Or enter a WhatsApp number (with country code)
            </label>
            <input
              type="text"
              id="manualNumber"
              name="manualNumber"
              value={manualNumber}
              onChange={(e) => setManualNumber(e.target.value)}
              placeholder="e.g., +919999999999 or 917777777777"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <p className="mt-2 text-sm text-gray-500">If provided, this number will be used even if no contacts are selected.</p>
          </div>

          {/* Scheduled Time */}
          <div>
            <label htmlFor="scheduled_time" className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Time
            </label>
            <input
              type="datetime-local"
              id="scheduled_time"
              name="scheduled_time"
              value={formData.scheduled_time}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
            <p className="mt-2 text-sm text-gray-500">Select date and time to send the message</p>
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
              {loading ? 'Sending...' : 'Send WhatsApp Message'}
            </button>
          </div>
        </form>
      </div>

      {/* Campaign Logs */}
      <WhatsAppCampaignLogs 
        logs={logs} 
        loading={logsLoading} 
        onRefresh={fetchLogs}
      />
    </div>
  )
}

export default WhatsAppMarketing

