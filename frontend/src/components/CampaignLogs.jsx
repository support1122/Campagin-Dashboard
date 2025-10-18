import { MdRefresh, MdCheckCircle, MdError, MdPending, MdWarning, MdExpandMore, MdExpandLess } from 'react-icons/md'
import { useState } from 'react'
import React from 'react'

const CampaignLogs = ({ logs, loading, onRefresh }) => {
  const [expandedRows, setExpandedRows] = useState(new Set())
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <MdCheckCircle className="text-green-500 text-xl" />
      case 'failed':
        return <MdError className="text-red-500 text-xl" />
      case 'partial':
        return <MdWarning className="text-yellow-500 text-xl" />
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
      case 'partial':
        return `${baseClasses} bg-yellow-100 text-yellow-700`
      case 'processing':
        return `${baseClasses} bg-blue-100 text-blue-700`
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

  const getEmailList = (emailsString) => {
    if (!emailsString) return []
    return emailsString.split(',').map(email => email.trim()).filter(email => email)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Campaign Logs</h2>
          <p className="text-sm text-gray-600 mt-1">View all your email campaign history</p>
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
          <p className="text-sm text-gray-500 mt-2">Send your first campaign to see logs here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Template Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Domain</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Template ID</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Success</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Failed</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => {
                const isExpanded = expandedRows.has(log.id)
                const deliverableEmails = getEmailList(log.deliverable_emails)
                const undeliverableEmails = getEmailList(log.undeliverable_emails)
                
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
                      <td className="px-4 py-4 text-gray-600">{log.domain_name}</td>
                      <td className="px-4 py-4 text-gray-600 font-mono text-sm">{log.template_id}</td>
                      <td className="px-4 py-4 text-center font-semibold text-gray-800">{log.total_emails}</td>
                      <td className="px-4 py-4 text-center font-semibold text-green-600">{log.successful_emails}</td>
                      <td className="px-4 py-4 text-center font-semibold text-red-600">{log.failed_emails}</td>
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
                        <td colSpan="9" className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {deliverableEmails.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                  ✓ Deliverable ({deliverableEmails.length})
                                </span>
                                {deliverableEmails.map((email, index) => (
                                  <span key={index} className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border">
                                    {email}
                                  </span>
                                ))}
                              </div>
                            )}
                            {undeliverableEmails.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
                                  ✗ Non-Deliverable ({undeliverableEmails.length})
                                </span>
                                {undeliverableEmails.map((email, index) => (
                                  <span key={index} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border">
                                    {email}
                                  </span>
                                ))}
                              </div>
                            )}
                            {deliverableEmails.length === 0 && undeliverableEmails.length === 0 && (
                              <span className="text-xs text-gray-500">
                                No email details available
                              </span>
                            )}
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

export default CampaignLogs



