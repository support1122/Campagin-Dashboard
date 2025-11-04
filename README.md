# Campaign Dashboard - Multi-Channel Marketing Automation Platform

A complete dashboard system for email and WhatsApp marketing automation using Django, React, SendGrid, and WATI. Send template emails, WhatsApp messages, track campaigns, and manage your marketing operations from a beautiful, modern interface.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-green)
![Django](https://img.shields.io/badge/Django-4.2-blue)
![React](https://img.shields.io/badge/React-18.2-blue)
![SendGrid](https://img.shields.io/badge/SendGrid-Integrated-orange)
![WATI](https://img.shields.io/badge/WATI-Integrated-green)

## 🚀 Features

### Current Features
- ✅ **Email Marketing Dashboard** - Send template emails via SendGrid
- ✅ **WhatsApp Marketing** - Send WhatsApp messages via WATI with approved templates
- ✅ **Campaign Scheduling** - Schedule WhatsApp messages for future delivery with Redis/Celery
- ✅ **Campaign Logging** - Track all sent campaigns with detailed statistics
- ✅ **Modern UI** - Beautiful, responsive interface built with React & Tailwind CSS
- ✅ **Real-time Status** - See success/failure status for each campaign
- ✅ **Bulk Sending** - Send to multiple recipients simultaneously
- ✅ **Template Management** - Use SendGrid dynamic templates
- ✅ **Analytics Dashboard** - Detailed campaign performance metrics

### Coming Soon
- 🔜 **SMS Marketing** - Multi-channel communication
- 🔜 **Contact Management** - Organize and segment your contacts
- 🔜 **Campaign Scheduling for Emails** - Schedule emails for future delivery

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** and npm - [Download Node.js](https://nodejs.org/)
- **Redis** (for Celery and scheduled tasks) - [Install Redis](https://redis.io/download)
- **SendGrid Account** - [Sign up for SendGrid](https://signup.sendgrid.com/)
- **WATI Account** - [Sign up for WATI](https://wati.io) (for WhatsApp messaging)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
cd /Users/apple/Desktop/temp/Email-Dashboard
```

---

### 2. Backend Setup (Django)

#### Step 1: Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
touch .env
```

Add the following configuration:

```env
# Django Settings
SECRET_KEY=your-secret-key-here-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite for development)
# DB_NAME=email_dashboard
# DB_USER=postgres
# DB_PASSWORD=postgres
# DB_HOST=localhost
# DB_PORT=5432

# SendGrid API Key (REQUIRED)
SENDGRID_API_KEY=SG.your-actual-sendgrid-api-key-here

# Redis (for Celery - optional for now)
REDIS_URL=redis://localhost:6379/0

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**📌 Important:** Replace `SENDGRID_API_KEY` with your actual SendGrid API key from [SendGrid Settings](https://app.sendgrid.com/settings/api_keys)

#### Step 4: Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

#### Step 5: Create Superuser (Optional - for Django Admin)

```bash
python manage.py createsuperuser
```

#### Step 6: Run Development Server

```bash
python manage.py runserver
```

Backend will be running at: `http://localhost:8000`

**Admin Panel:** `http://localhost:8000/admin`

---

### 3. Frontend Setup (React)

Open a **new terminal window** and navigate to the frontend directory:

```bash
cd /Users/apple/Desktop/temp/Email-Dashboard/frontend
```

#### Step 1: Install Dependencies

```bash
npm install
```

#### Step 2: Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
touch .env
```

Add the following:

```env
VITE_API_URL=http://localhost:8000/api
```

#### Step 3: Run Development Server

```bash
npm run dev
```

Frontend will be running at: `http://localhost:5173`

---

## 🎯 How to Use

### 1. Access the Dashboard

Open your browser and go to: `http://localhost:5173`

### 2. Navigate to Emails Section

Click on **"Emails"** in the left sidebar.

### 3. Send an Email Campaign

Fill in the form with:

1. **Domain Name** - Your verified SendGrid domain (e.g., `yourdomain.com`)
2. **Template Name** - A friendly name for your reference (e.g., "Welcome Email")
3. **Template ID** - Your SendGrid template ID (e.g., `d-1234567890abcdef`)
   - Find this in SendGrid → Email API → Dynamic Templates
4. **Email IDs** - Comma-separated recipient emails
   - Example: `user1@example.com, user2@example.com, user3@example.com`

### 4. Click "Hit - Send Campaign"

The system will:
- Validate all fields
- Send emails via SendGrid API
- Display success/failure status
- Log the campaign in the database

### 5. View Campaign Logs

Scroll down to see all your campaign history with:
- Status (Success/Failed/Partial)
- Template details
- Success/failure counts
- Timestamps

---

## 📡 API Endpoints

### Email Campaign APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/emails/campaigns/send_email/` | Send email campaign |
| `GET` | `/api/emails/campaigns/logs/` | Get all campaign logs |
| `GET` | `/api/emails/campaigns/` | List all campaigns |
| `GET` | `/api/emails/campaigns/{id}/` | Get specific campaign |

### WhatsApp Campaign APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/whatsapp/campaigns/send_message/` | Send or schedule WhatsApp message |
| `GET` | `/api/whatsapp/campaigns/templates/` | Get approved WATI templates |
| `GET` | `/api/whatsapp/campaigns/logs/` | Get all campaign logs |
| `GET` | `/api/whatsapp/campaigns/` | List all campaigns |
| `GET` | `/api/whatsapp/campaigns/{id}/` | Get specific campaign |

### Example: Send Email Campaign

```bash
curl -X POST http://localhost:8000/api/emails/campaigns/send_email/ \
  -H "Content-Type: application/json" \
  -d '{
    "domain_name": "example.com",
    "template_name": "Welcome Email",
    "template_id": "d-1234567890abcdef",
    "recipients": "user1@example.com, user2@example.com"
  }'
```

### Example: Send WhatsApp Campaign

```bash
curl -X POST http://localhost:8000/api/whatsapp/campaigns/send_message/ \
  -H "Content-Type: application/json" \
  -d '{
    "template_name": "Welcome Message",
    "template_id": "template_123",
    "mobile_number": "+919876543210",
    "scheduled_time": "2025-01-20T10:30:00Z"
  }'
```

### Example: Get WATI Templates

```bash
curl -X GET http://localhost:8000/api/whatsapp/campaigns/templates/
```

---

## 🔧 SendGrid Configuration

### 1. Create SendGrid Account

Sign up at [SendGrid](https://signup.sendgrid.com/)

### 2. Create API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it (e.g., "Email Dashboard")
4. Select **Full Access** or **Restricted Access** with Mail Send permissions
5. Copy the API key and add it to your `.env` file

### 3. Verify Domain (Optional but Recommended)

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender** or **Authenticate Your Domain**
3. Follow the verification steps

### 4. Create Dynamic Templates

1. Go to **Email API** → **Dynamic Templates**
2. Click **Create a Dynamic Template**
3. Give it a name and click **Save**
4. Click on the template and add a version
5. Use the drag-and-drop editor or HTML editor
6. Save and note the **Template ID** (e.g., `d-1234567890abcdef`)

---

## 💬 WhatsApp (WATI) Configuration

### 1. Create WATI Account

Sign up at [WATI](https://wati.io)

### 2. Get API Credentials

1. Go to **API Docs** section in your WATI dashboard
2. Copy your:
   - **API Endpoint URL** (e.g., `https://your-instance.wati.io`)
   - **Access Token** (Bearer token)

### 3. Configure in Application

Add to your `.env` file:

```bash
# WhatsApp Services (WATI)
WATI_API_BASE_URL=https://your-instance.wati.io
WATI_API_TOKEN=your-access-token-here
```

### 4. Create Approved WhatsApp Templates

1. Go to **Templates** section in WATI
2. Create and submit templates for approval
3. Wait for WhatsApp approval
4. Approved templates will appear in the dropdown automatically

For detailed setup instructions, see [WHATSAPP_SETUP.md](WHATSAPP_SETUP.md)

---

## 🚀 Optional: Celery Setup (For Scheduled Campaigns)

### 1. Install Redis

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

### 2. Run Celery Worker

In a new terminal:

```bash
cd backend
source venv/bin/activate
celery -A config worker -l info
```

### 3. Run Celery Beat (For Scheduling)

In another terminal:

```bash
cd backend
source venv/bin/activate
celery -A config beat -l info
```

---

## 📁 Project Structure

```
Email-Dashboard/
├── backend/                 # Django Backend
│   ├── config/             # Project settings
│   │   ├── settings.py     # Main configuration
│   │   ├── urls.py         # URL routing
│   │   └── celery.py       # Celery configuration
│   ├── emails/             # Email app
│   │   ├── models.py       # EmailCampaign model
│   │   ├── views.py        # API views
│   │   ├── serializers.py  # DRF serializers
│   │   ├── services.py     # SendGrid integration
│   │   ├── tasks.py        # Celery tasks
│   │   └── admin.py        # Django admin
│   ├── manage.py           # Django CLI
│   └── requirements.txt    # Python dependencies
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── EmailMarketing.jsx
│   │   │   └── CampaignLogs.jsx
│   │   ├── services/       # API integration
│   │   │   └── api.js
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite configuration
│
└── README.md               # This file
```

---

## 🎨 Tech Stack

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API development
- **SendGrid API** - Email delivery
- **Celery** - Task queue (for scheduling)
- **Redis** - Message broker
- **SQLite/PostgreSQL** - Database

### Frontend
- **React 18.2** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Toastify** - Notifications

---

## 🐛 Troubleshooting

### Backend Issues

**Error: No module named 'decouple'**
```bash
pip install python-decouple
```

**Error: SENDGRID_API_KEY not configured**
- Make sure `.env` file exists in `backend/` directory
- Verify `SENDGRID_API_KEY` is set correctly

**Database errors:**
```bash
python manage.py makemigrations
python manage.py migrate
```

### Frontend Issues

**Port 5173 already in use:**
```bash
# Kill the process or change port in vite.config.js
lsof -ti:5173 | xargs kill -9
```

**API connection errors:**
- Check backend is running on `http://localhost:8000`
- Verify `VITE_API_URL` in frontend `.env`

### SendGrid Issues

**403 Forbidden:**
- Check API key has correct permissions
- Verify sender email is authenticated

**Template not found:**
- Verify template ID is correct
- Check template is published in SendGrid

---

## 🔐 Security Notes

**For Production:**

1. Change `SECRET_KEY` in Django settings
2. Set `DEBUG=False`
3. Use environment variables for all sensitive data
4. Use PostgreSQL instead of SQLite
5. Enable HTTPS
6. Configure proper CORS settings
7. Use Gunicorn for Django
8. Build React for production: `npm run build`

---

## 📈 Future Roadmap

- [ ] Campaign scheduling with Celery Beat
- [ ] WhatsApp integration via Twilio
- [ ] SMS marketing capabilities
- [ ] Email analytics and metrics
- [ ] Contact list management
- [ ] A/B testing for campaigns
- [ ] Email template builder
- [ ] Webhook handling for delivery status
- [ ] Multi-user support with authentication
- [ ] Role-based access control

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 💬 Support

For issues or questions:
- Create an issue in this repository
- Check SendGrid documentation: [SendGrid Docs](https://docs.sendgrid.com/)
- Check Django documentation: [Django Docs](https://docs.djangoproject.com/)

---

## 🎉 Credits

Built with ❤️ using Django, React, and SendGrid

**Happy Email Marketing! 🚀**



# Email-Dashboard
