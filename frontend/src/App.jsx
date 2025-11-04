import { useState } from 'react'
import Sidebar from './components/Sidebar'
import EmailMarketing from './components/EmailMarketing'
import WhatsAppMarketing from './components/WhatsAppMarketing'
import Analytics from './components/Analytics'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const [activeSection, setActiveSection] = useState('emails')

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeSection === 'emails' && <EmailMarketing />}
        {activeSection === 'whatsapp' && <WhatsAppMarketing />}
        {activeSection === 'analytics' && <Analytics />}
        {activeSection === 'dashboard' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="mt-4 text-gray-600">Welcome to your Email Dashboard! Navigate to Emails to send campaigns or Analytics to view insights.</p>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}

export default App



