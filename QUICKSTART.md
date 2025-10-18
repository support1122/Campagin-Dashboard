# 🚀 Quick Start Guide

Get your Email Dashboard up and running in 5 minutes!

## Prerequisites Checklist
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] SendGrid account created
- [ ] SendGrid API key obtained

---

## Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY_HERE
REDIS_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
EOF

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

✅ Backend running at: **http://localhost:8000**

---

## Step 2: Frontend Setup (2 minutes)

Open a **NEW terminal window**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
```

✅ Frontend running at: **http://localhost:5173**

---

## Step 3: Configure SendGrid (1 minute)

1. Go to [SendGrid API Keys](https://app.sendgrid.com/settings/api_keys)
2. Click **Create API Key**
3. Give it a name and select **Full Access**
4. Copy the API key
5. Paste it in `backend/.env` as `SENDGRID_API_KEY`
6. Restart the backend server

---

## Step 4: Create a Template (Optional)

1. Go to [SendGrid Templates](https://mc.sendgrid.com/dynamic-templates)
2. Click **Create a Dynamic Template**
3. Name it (e.g., "Test Email")
4. Click on the template and add a version
5. Design your email
6. Copy the **Template ID** (e.g., `d-1234567890abcdef`)

---

## Step 5: Send Your First Campaign! 🎉

1. Open **http://localhost:5173** in your browser
2. Click **"Emails"** in the sidebar
3. Fill in:
   - Domain Name: Your verified domain (or any domain for testing)
   - Template Name: "My First Campaign"
   - Template ID: Paste from SendGrid
   - Email IDs: Your email address
4. Click **"Hit - Send Campaign"**

✅ Check your inbox!

---

## Troubleshooting

### Backend won't start?
```bash
# Check if port 8000 is in use
lsof -ti:8000 | xargs kill -9

# Try again
python manage.py runserver
```

### Frontend won't start?
```bash
# Check if port 5173 is in use
lsof -ti:5173 | xargs kill -9

# Try again
npm run dev
```

### SendGrid errors?
- Verify API key is correct in `.env`
- Check API key has Mail Send permissions
- Verify sender email is authenticated in SendGrid

---

## 🎯 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Set up Celery for scheduled campaigns
- Integrate WhatsApp and SMS
- Customize the UI

---

**Need help?** Check the main README or create an issue.

**Happy emailing! 📧**



