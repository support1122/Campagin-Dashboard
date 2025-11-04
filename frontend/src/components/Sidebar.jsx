import { MdEmail, MdDashboard, MdAnalytics, MdMessage } from 'react-icons/md'

const Sidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: MdDashboard },
    { id: 'emails', name: 'Emails', icon: MdEmail },
    { id: 'whatsapp', name: 'WhatsApp', icon: MdMessage },
    { id: 'analytics', name: 'Analytics', icon: MdAnalytics },
  ]

  return (
    <div className="w-64 bg-gradient-to-b from-primary-700 to-primary-900 text-white shadow-2xl">
      {/* Logo/Header */}
      <div className="p-6 border-b border-primary-600">
        <h1 className="text-2xl font-bold">Email Dashboard</h1>
        <p className="text-sm text-primary-200 mt-1">Marketing Automation</p>
      </div>

      {/* Menu Items */}
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`
                w-full flex items-center gap-3 px-6 py-4 transition-all duration-200
                ${isActive 
                  ? 'bg-white text-primary-700 border-r-4 border-primary-500 font-semibold' 
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                }
              `}
            >
              <Icon className="text-2xl" />
              <span className="text-base">{item.name}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-64 p-6 border-t border-primary-600">
        <p className="text-xs text-primary-300">© 2025 Email Dashboard</p>
        <p className="text-xs text-primary-400 mt-1">v1.0.0</p>
      </div>
    </div>
  )
}

export default Sidebar



