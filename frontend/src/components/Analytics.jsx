import React, { useState, useEffect, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { getCampaignLogs } from '../services/api'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

const Analytics = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await getCampaignLogs()
      if (response.success) {
        setLogs(response.data)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Process data for charts
  const chartData = useMemo(() => {
    if (!logs.length) return null

    // Campaigns over time (last 30 days)
    const last30Days = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      last30Days.push(date.toISOString().split('T')[0])
    }

    const campaignsByDate = last30Days.map(date => {
      const dayLogs = logs.filter(log => 
        new Date(log.created_at).toISOString().split('T')[0] === date
      )
      return {
        date,
        total: dayLogs.length,
        successful: dayLogs.reduce((sum, log) => sum + log.successful_emails, 0),
        failed: dayLogs.reduce((sum, log) => sum + log.failed_emails, 0)
      }
    })

    // Success vs Failure rates
    const totalSuccessful = logs.reduce((sum, log) => sum + log.successful_emails, 0)
    const totalFailed = logs.reduce((sum, log) => sum + log.failed_emails, 0)
    const totalEmails = totalSuccessful + totalFailed

    // Template performance
    const templateStats = {}
    logs.forEach(log => {
      if (!templateStats[log.template_name]) {
        templateStats[log.template_name] = {
          campaigns: 0,
          successful: 0,
          failed: 0,
          total: 0
        }
      }
      templateStats[log.template_name].campaigns++
      templateStats[log.template_name].successful += log.successful_emails
      templateStats[log.template_name].failed += log.failed_emails
      templateStats[log.template_name].total += log.total_emails
    })

    // Campaign status distribution
    const statusCounts = {}
    logs.forEach(log => {
      statusCounts[log.status] = (statusCounts[log.status] || 0) + 1
    })

    return {
      campaignsOverTime: campaignsByDate,
      successFailureRates: { successful: totalSuccessful, failed: totalFailed, total: totalEmails },
      templatePerformance: templateStats,
      statusDistribution: statusCounts
    }
  }, [logs])

  // Chart configurations
  const campaignsOverTimeConfig = {
    labels: chartData?.campaignsOverTime.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }) || [],
    datasets: [
      {
        label: 'Successful Emails',
        data: chartData?.campaignsOverTime.map(item => item.successful) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Failed Emails',
        data: chartData?.campaignsOverTime.map(item => item.failed) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  }

  const successFailureConfig = {
    labels: ['Successful', 'Failed'],
    datasets: [
      {
        data: chartData ? [chartData.successFailureRates.successful, chartData.successFailureRates.failed] : [],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderColor: ['#16a34a', '#dc2626'],
        borderWidth: 2,
      },
    ],
  }

  const templatePerformanceConfig = {
    labels: chartData ? Object.keys(chartData.templatePerformance) : [],
    datasets: [
      {
        label: 'Success Rate (%)',
        data: chartData ? Object.values(chartData.templatePerformance).map(template => 
          template.total > 0 ? Math.round((template.successful / template.total) * 100) : 0
        ) : [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  }

  const statusDistributionConfig = {
    labels: chartData ? Object.keys(chartData.statusDistribution) : [],
    datasets: [
      {
        data: chartData ? Object.values(chartData.statusDistribution) : [],
        backgroundColor: [
          '#22c55e', // success
          '#ef4444', // failed
          '#f59e0b', // partial
          '#3b82f6', // processing
          '#6b7280', // pending
        ],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!logs.length) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">No campaign data available for analytics</p>
          <p className="text-sm text-gray-500 mt-2">Send some campaigns to see analytics here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Campaign performance insights and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Campaigns</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{logs.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Emails Sent</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {chartData?.successFailureRates.total || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Success Rate</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {chartData?.successFailureRates.total > 0 
              ? Math.round((chartData.successFailureRates.successful / chartData.successFailureRates.total) * 100)
              : 0}%
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Avg Emails/Campaign</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {logs.length > 0 ? Math.round(logs.reduce((sum, log) => sum + log.total_emails, 0) / logs.length) : 0}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Campaigns Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Emails Sent Over Time (Last 30 Days)</h3>
          <div className="h-80">
            <Bar data={campaignsOverTimeConfig} options={chartOptions} />
          </div>
        </div>

        {/* Success vs Failure Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Success vs Failure Rate</h3>
          <div className="h-80 flex justify-center">
            <div className="w-64 h-64">
              <Doughnut data={successFailureConfig} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Template Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Template Performance</h3>
          <div className="h-80">
            <Bar data={templatePerformanceConfig} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  display: false
                }
              }
            }} />
          </div>
        </div>

        {/* Campaign Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Campaign Status Distribution</h3>
          <div className="h-80 flex justify-center">
            <div className="w-64 h-64">
              <Doughnut data={statusDistributionConfig} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Campaigns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {log.template_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(log.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {log.total_emails}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                    {log.successful_emails}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600 font-medium">
                    {log.failed_emails}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      log.status === 'success' ? 'bg-green-100 text-green-800' :
                      log.status === 'failed' ? 'bg-red-100 text-red-800' :
                      log.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analytics
