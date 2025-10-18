# Project Structure Documentation

## 📂 Complete File Tree

```
Email-Dashboard/
│
├── backend/                          # Django Backend Application
│   ├── config/                       # Django Project Configuration
│   │   ├── __init__.py              # Celery app initialization
│   │   ├── settings.py              # Django settings (DB, CORS, SendGrid, Celery)
│   │   ├── urls.py                  # Root URL configuration
│   │   ├── wsgi.py                  # WSGI server configuration
│   │   ├── asgi.py                  # ASGI server configuration
│   │   └── celery.py                # Celery configuration for task queue
│   │
│   ├── emails/                       # Email Campaign App
│   │   ├── __init__.py
│   │   ├── models.py                # EmailCampaign model (stores campaign logs)
│   │   ├── views.py                 # API ViewSets (send email, get logs)
│   │   ├── serializers.py           # DRF serializers for validation
│   │   ├── services.py              # SendGrid email service
│   │   ├── tasks.py                 # Celery tasks for async sending
│   │   ├── admin.py                 # Django admin configuration
│   │   ├── urls.py                  # Email API routes
│   │   └── apps.py                  # App configuration
│   │
│   ├── manage.py                     # Django CLI management
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Environment variables template
│   ├── .gitignore                    # Git ignore patterns
│   └── db.sqlite3                    # SQLite database (auto-generated)
│
├── frontend/                         # React Frontend Application
│   ├── src/
│   │   ├── components/               # React Components
│   │   │   ├── Sidebar.jsx          # Left sidebar navigation
│   │   │   ├── EmailMarketing.jsx   # Email form and campaign sending
│   │   │   └── CampaignLogs.jsx     # Campaign history table
│   │   │
│   │   ├── services/                 # API Integration
│   │   │   └── api.js               # Axios API client
│   │   │
│   │   ├── App.jsx                   # Main application component
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Global styles + Tailwind imports
│   │
│   ├── public/                       # Static assets
│   ├── index.html                    # HTML template
│   ├── package.json                  # Node dependencies
│   ├── vite.config.js                # Vite build configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   ├── .env.example                  # Environment variables template
│   └── .gitignore                    # Git ignore patterns
│
├── README.md                         # Complete documentation
├── QUICKSTART.md                     # 5-minute setup guide
├── PROJECT_STRUCTURE.md              # This file
└── .gitignore                        # Root git ignore

```

---

## 🗂️ Component Breakdown

### Backend Components

#### 1. **config/** - Project Configuration
| File | Purpose |
|------|---------|
| `settings.py` | Django settings, database config, CORS, REST Framework, Celery |
| `urls.py` | Root URL routing, includes email API routes |
| `celery.py` | Celery configuration for background tasks |
| `wsgi.py` | Production WSGI server entry point |

#### 2. **emails/** - Email Marketing App
| File | Purpose |
|------|---------|
| `models.py` | `EmailCampaign` model - stores all campaign data and logs |
| `views.py` | REST API endpoints - send emails, retrieve logs |
| `serializers.py` | Data validation and serialization for API |
| `services.py` | SendGrid integration - handles actual email sending |
| `tasks.py` | Celery tasks for asynchronous email sending |
| `admin.py` | Django admin panel configuration |

#### 3. **Database Schema**

**EmailCampaign Model:**
```python
{
    'id': int,
    'domain_name': str,
    'template_name': str,
    'template_id': str,
    'recipients': str (comma-separated),
    'status': str (pending/processing/success/failed/partial),
    'total_emails': int,
    'successful_emails': int,
    'failed_emails': int,
    'error_message': str,
    'created_at': datetime,
    'updated_at': datetime
}
```

---

### Frontend Components

#### 1. **App.jsx** - Main Application
- Root component
- Manages active section state
- Renders Sidebar + Main content
- Includes toast notifications

#### 2. **Sidebar.jsx** - Navigation
- Left sidebar menu
- Dashboard and Emails sections
- Active state highlighting
- Gradient styling

#### 3. **EmailMarketing.jsx** - Campaign Form
- 5 input fields (domain, template name, template ID, recipients)
- Form validation
- API integration for sending
- Loads and displays campaign logs
- Toast notifications for success/error

#### 4. **CampaignLogs.jsx** - History Table
- Displays all campaign history
- Status badges with colors
- Success/failed counts
- Refresh functionality
- Formatted timestamps

#### 5. **api.js** - API Service
- Axios HTTP client
- Base URL configuration
- API endpoints:
  - `sendEmailCampaign()`
  - `getCampaignLogs()`

---

## 🔄 Data Flow

### Sending an Email Campaign

```
User fills form
    ↓
EmailMarketing.jsx validates input
    ↓
api.sendEmailCampaign() called
    ↓
POST /api/emails/campaigns/send_email/
    ↓
Django REST Framework receives request
    ↓
SendEmailSerializer validates data
    ↓
EmailCampaign record created in database
    ↓
EmailService.send_template_email() called
    ↓
SendGrid API sends emails
    ↓
Campaign status updated (success/failed/partial)
    ↓
Response sent to frontend
    ↓
Toast notification shown
    ↓
Campaign logs refreshed
```

### Viewing Campaign Logs

```
Component mounts
    ↓
api.getCampaignLogs() called
    ↓
GET /api/emails/campaigns/logs/
    ↓
Django queries EmailCampaign.objects.all()
    ↓
Serializes data
    ↓
Returns JSON response
    ↓
CampaignLogs.jsx renders table
```

---

## 🛣️ API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/emails/campaigns/send_email/` | Send email campaign |
| `GET` | `/api/emails/campaigns/logs/` | Get all campaign logs |
| `GET` | `/api/emails/campaigns/` | List all campaigns (REST) |
| `GET` | `/api/emails/campaigns/{id}/` | Get specific campaign |
| `PUT` | `/api/emails/campaigns/{id}/` | Update campaign |
| `DELETE` | `/api/emails/campaigns/{id}/` | Delete campaign |

---

## 🎨 Styling Architecture

### Tailwind CSS Classes Used

**Colors:**
- Primary: Blue shades (primary-50 to primary-900)
- Status colors: green (success), red (failed), yellow (partial)

**Components:**
- Cards: `bg-white rounded-lg shadow-lg`
- Buttons: `px-4 py-3 rounded-lg`
- Inputs: `border border-gray-300 rounded-lg focus:ring-2`

**Responsive:**
- Uses Tailwind's responsive utilities
- Mobile-friendly table with overflow-x-auto

---

## 📦 Dependencies

### Backend (Python)
```
Django==4.2.7              # Web framework
djangorestframework==3.14.0  # REST API
django-cors-headers==4.3.1   # CORS support
python-decouple==3.8        # Environment variables
sendgrid==6.11.0           # Email service
celery==5.3.4              # Task queue
redis==5.0.1               # Message broker
psycopg2-binary==2.9.9     # PostgreSQL adapter
gunicorn==21.2.0           # Production server
```

### Frontend (Node.js)
```
react: ^18.2.0             # UI library
react-dom: ^18.2.0         # DOM rendering
axios: ^1.6.2              # HTTP client
react-icons: ^4.12.0       # Icon library
react-toastify: ^9.1.3     # Notifications
vite: ^5.0.8               # Build tool
tailwindcss: ^3.3.6        # CSS framework
```

---

## 🔌 Environment Variables

### Backend (.env)
```
SECRET_KEY                 # Django secret key
DEBUG                      # Debug mode (True/False)
ALLOWED_HOSTS             # Allowed hostnames
SENDGRID_API_KEY          # SendGrid API key (REQUIRED)
REDIS_URL                 # Redis connection string
CORS_ALLOWED_ORIGINS      # CORS whitelist
```

### Frontend (.env)
```
VITE_API_URL              # Backend API URL
```

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Celery (Optional):**
```bash
cd backend
source venv/bin/activate
celery -A config worker -l info
```

### Production Mode

**Backend:**
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

**Frontend:**
```bash
npm run build
# Serve the dist/ folder with nginx or similar
```

---

## 🧪 Testing the Application

### Manual Testing Steps

1. **Start both servers**
2. **Open http://localhost:5173**
3. **Fill in campaign form:**
   - Domain: `example.com`
   - Template Name: `Test Campaign`
   - Template ID: Your SendGrid template ID
   - Recipients: Your email address
4. **Click "Hit - Send Campaign"**
5. **Verify:**
   - Toast notification appears
   - Campaign appears in logs table
   - Email received in inbox
6. **Check Django Admin:**
   - Go to http://localhost:8000/admin
   - View EmailCampaign records

---

## 🔐 Security Considerations

### Current Implementation
- ✅ CORS configured for frontend origin
- ✅ Environment variables for secrets
- ✅ Input validation in serializers
- ✅ Email validation
- ✅ SQLite for development

### Production Recommendations
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set DEBUG=False
- [ ] Use strong SECRET_KEY
- [ ] Add authentication/authorization
- [ ] Rate limiting for API
- [ ] HTTPS only
- [ ] Secure SendGrid API key storage
- [ ] Database backups
- [ ] Logging and monitoring

---

## 📈 Scalability Notes

### Current Capacity
- Single server setup
- Synchronous email sending
- SQLite database
- Good for: Small teams, low volume (<100 emails/day)

### To Scale Up
1. **Switch to PostgreSQL** for better concurrency
2. **Enable Celery tasks** for async sending
3. **Add Redis** for queue management
4. **Use Gunicorn workers** for Django
5. **Deploy on cloud** (AWS, Heroku, DigitalOcean)
6. **Add CDN** for frontend assets
7. **Implement caching** (Redis)
8. **Load balancing** for multiple instances

---

## 🐛 Common Issues & Solutions

### Issue: SendGrid 403 Forbidden
**Solution:** Check API key permissions, verify sender authentication

### Issue: CORS errors
**Solution:** Verify CORS_ALLOWED_ORIGINS includes frontend URL

### Issue: Database locked (SQLite)
**Solution:** Switch to PostgreSQL for production

### Issue: Port already in use
**Solution:** Kill process on port or change port number

---

## 🎯 Future Enhancements

Refer to README.md for the complete roadmap.

---

**Last Updated:** October 2025



