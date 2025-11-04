import { MdRefresh, MdCheckCircle, MdError, MdPending, MdSchedule, MdExpandMore, MdExpandLess, MdDelete } from 'react-icons/md'
import { toast } from 'react-toastify'
import { sendWhatsAppNow, sendWhatsAppFollowup, cancelWhatsAppCampaign } from '../services/api'
import { useState } from 'react'
import React from 'react'

const WhatsAppCampaignLogs = ({ logs, loading, onRefresh }) => {
  const [expandedRows, setExpandedRows] = useState(new Set())
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <MdCheckCircle className="text-green-500 text-xl" />
      case 'failed':
        return <MdError className="text-red-500 text-xl" />
      case 'scheduled':
        return <MdSchedule className="text-blue-500 text-xl" />
      case 'processing':
        return <MdPending className="text-blue-500 text-xl animate-spin" />
      default:
        return <MdPending className="text-gray-500 text-xl" />
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold uppercase"
    
    switch (status) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-700`
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-700`
      case 'scheduled':
        return `${baseClasses} bg-blue-100 text-blue-700`
      case 'processing':
        return `${baseClasses} bg-yellow-100 text-yellow-700`
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleRow = (logId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId)
    } else {
      newExpanded.add(logId)
    }
    setExpandedRows(newExpanded)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Campaign Logs</h2>
          <p className="text-sm text-gray-600 mt-1">View all your WhatsApp campaign history</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
        >
          <MdRefresh className={`text-xl ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <MdError className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No campaign logs found</p>
          <p className="text-sm text-gray-500 mt-2">Send your first WhatsApp campaign to see logs here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Template Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Template ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mobile Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Scheduled Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sent At</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => {
                const isExpanded = expandedRows.has(log.id)
                
                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className={getStatusBadge(log.status)}>{log.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-800">{log.template_name}</td>
                      <td className="px-4 py-4 text-gray-600 font-mono text-sm">{log.template_id}</td>
                      <td className="px-4 py-4 text-gray-600">{log.mobile_number}</td>
                      <td className="px-4 py-4 text-gray-600 text-sm">{formatDate(log.scheduled_time)}</td>
                      <td className="px-4 py-4 text-gray-600 text-sm">
                        {log.sent_at ? formatDate(log.sent_at) : '-'}
                      </td>
                      <td className="px-4 py-4 text-gray-600 text-sm">{formatDate(log.created_at)}</td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => toggleRow(log.id)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                          {isExpanded ? 'Hide' : 'Show'} Details
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan="8" className="px-4 py-3">
                          <div className="space-y-2">
                            {log.error_message && (
                              <div>
                                <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
                                  Error Message
                                </span>
                                <p className="text-xs text-red-600 mt-1">{log.error_message}</p>
                              </div>
                            )}
                            {!log.error_message && (
                              <span className="text-xs text-gray-500">No additional details available</span>
                            )}

                            <div className="pt-2 flex flex-wrap gap-2 items-center">
                              {log.status === 'scheduled' && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await sendWhatsAppNow(log.id)
                                      if (res.success) {
                                        toast.success('Message sent')
                                        onRefresh && onRefresh()
                                      } else {
                                        toast.error(res.error || 'Failed to send')
                                      }
                                    } catch (e) {
                                      toast.error('Failed to send')
                                    }
                                  }}
                                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700"
                                >
                                  Send Now
                                </button>
                              )}

                              {log.status === 'scheduled' && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await cancelWhatsAppCampaign(log.id)
                                      if (res.success) {
                                        toast.success('Removed from schedule')
                                        onRefresh && onRefresh()
                                      } else {
                                        toast.error(res.error || 'Failed to remove')
                                      }
                                    } catch (e) {
                                      toast.error('Failed to remove')
                                    }
                                  }}
                                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                                  title="Remove from worker"
                                >
                                  <MdDelete /> Remove
                                </button>
                              )}

                              {log.template_name === 'payment_reminder_first' && log.status !== 'success' && (
                                <>
                                  <span className="text-xs text-gray-500 ml-2">Follow-ups:</span>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await sendWhatsAppFollowup(log.id, 'second')
                                        if (res.success) {
                                          toast.success('Second reminder sent')
                                          onRefresh && onRefresh()
                                        } else {
                                          toast.error(res.error || 'Failed to send second')
                                        }
                                      } catch (e) {
                                        toast.error('Failed to send second')
                                      }
                                    }}
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                  >
                                    Send Second Now
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await sendWhatsAppFollowup(log.id, 'third')
                                        if (res.success) {
                                          toast.success('Third reminder sent')
                                          onRefresh && onRefresh()
                                        } else {
                                          toast.error(res.error || 'Failed to send third')
                                        }
                                      } catch (e) {
                                        toast.error('Failed to send third')
                                      }
                                    }}
                                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                                  >
                                    Send Third Now
                                  </button>
                                  <div className="w-full text-xs text-gray-500">
                                    Will be auto-sent: second at {formatDate(new Date((log.scheduled_time || log.created_at)))} + 4 days, third + 10 days.
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default WhatsAppCampaignLogs

