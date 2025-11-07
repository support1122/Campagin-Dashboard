# 🚀 Complete Render Deployment Setup Guide

## 📋 **Prerequisites**
- GitHub repository: `https://github.com/support1122/Campagin-Dashboard`
- Render account (free at render.com)
- Your API keys ready

---

## 🗄️ **Step 1: Deploy PostgreSQL Database**

### **1.1 Create Database on Render**
1. **Go to render.com**
2. **Sign up/Login**
3. **Click "New +" → "PostgreSQL"**
4. **Fill in the details:**
   ```
   Name: email-dashboard-db
   Database: email_dashboard
   User: email_user
   Plan: Free
   Region: Oregon (US West)
   ```
5. **Click "Create Database"**

### **1.2 Get Database URL**
1. **Wait for database to be created (2-3 minutes)**
2. **Copy the "External Database URL"**
3. **It looks like:**
   ```
   postgresql://email_user:password@host:port/email_dashboard
   ```

---

## 🐍 **Step 2: Deploy Backend (Django)**

### **2.1 Create Backend Service**
1. **Go to render.com dashboard**
2. **Click "New +" → "Web Service"**
3. **Connect GitHub repository:**
   ```
   Repository: support1122/Campagin-Dashboard
   Branch: main
   ```

### **2.2 Configure Backend**
```
Name: email-dashboard-backend
Environment: Python 3
Region: Oregon (US West)
Branch: main
Root Directory: backend
```

### **2.3 Build & Start Commands**
```
Build Command:
cd backend && pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput

Start Command:
cd backend && gunicorn config.wsgi:application
```

### **2.4 Environment Variables**
Add these environment variables in Render:

```
SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=False
ALLOWED_HOSTS=your-backend-name.onrender.com
DATABASE_URL=<paste the database URL from step 1.2>
SENDGRID_API_KEY=your-sendgrid-api-key-here
KICKBOX_API_KEY=your-kickbox-api-key-here
SENDER_EMAIL=your-email@domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-name.onrender.com
```

**Note: Replace `your-backend-name` and `your-frontend-name` with actual names you'll get from Render!**

**Template ID Note:** The system uses template IDs from the UI form, not environment variables. You can use different SendGrid template IDs for each campaign.

### **2.5 Configure Celery on Render**

Automatic WhatsApp scheduling relies on Celery workers. Docker starts them for you, but on Render you must create two additional services.

#### **Celery Worker (Background Worker)**
```
Name: email-dashboard-celery-worker
Environment: Python 3
Region: (match backend)
Branch: main
Root Directory: backend

Build Command:
cd backend && pip install -r requirements.txt

Start Command:
cd backend && celery -A config worker --loglevel=info
```

#### **Celery Beat (Scheduler)**
Runs the hourly fallback that re-sends missed WhatsApp messages.
```
Name: email-dashboard-celery-beat
Environment: Python 3
Region: (match backend)
Branch: main
Root Directory: backend

Build Command:
cd backend && pip install -r requirements.txt

Start Command:
cd backend && celery -A config beat --loglevel=info
```

> 💡 Use Render's “Copy environment variables” feature so both services get the same env vars as the backend (SECRET_KEY, DATABASE_URL, REDIS_URL, etc.).

### **2.6 Deploy Backend**
1. **Click "Create Web Service"**
2. **Wait for deployment (5-10 minutes)**
3. **Copy the backend URL (e.g., `https://email-dashboard-backend.onrender.com`)**

---

## ⚛️ **Step 3: Deploy Frontend (React)**

### **3.1 Create Frontend Service**
1. **Go to render.com dashboard**
2. **Click "New +" → "Static Site"**
3. **Connect GitHub repository:**
   ```
   Repository: support1122/Campagin-Dashboard
   Branch: main
   ```

### **3.2 Configure Frontend**
```
Name: email-dashboard-frontend
Environment: Static Site
Region: Oregon (US West)
Branch: main
Root Directory: frontend
```

### **3.3 Build Settings**
```
Build Command:
npm install && npm run build

Publish Directory: dist
```

### **3.4 Environment Variables**
Add these environment variables:

```
VITE_API_URL=https://your-backend-name.onrender.com/api
VITE_APP_TITLE=Email Dashboard
VITE_APP_VERSION=1.0.0
```

**Replace `your-backend-name` with your actual backend URL!**

### **3.5 Deploy Frontend**
1. **Click "Create Static Site"**
2. **Wait for deployment (3-5 minutes)**
3. **Copy the frontend URL (e.g., `https://email-dashboard-frontend.onrender.com`)**

---

## 🔗 **Step 4: Update CORS Settings**

### **4.1 Update Backend CORS**
1. **Go to your backend service on Render**
2. **Click "Environment" tab**
3. **Update CORS_ALLOWED_ORIGINS:**
   ```
   CORS_ALLOWED_ORIGINS=https://your-frontend-name.onrender.com
   ```
4. **Click "Save Changes"**
5. **Wait for redeployment**

---

## ✅ **Step 5: Test Your Deployment**

### **5.1 Test Backend API**
Visit: `https://your-backend-name.onrender.com/api/emails/campaigns/logs/`

**Expected response:**
```json
[]
```

### **5.2 Test Frontend**
Visit: `https://your-frontend-name.onrender.com`

**Expected:**
- Email Dashboard interface loads
- No console errors
- Can send test emails

### **5.3 Test Full Flow**
1. **Open frontend**
2. **Fill in email form**
3. **Send test email**
4. **Check campaign logs**
5. **Verify email delivery**

---

## 🔧 **Environment Variables Summary**

### **Backend (Django) - 8 Variables:**
```bash
SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=False
ALLOWED_HOSTS=your-backend-name.onrender.com
DATABASE_URL=<provided by Render PostgreSQL>
SENDGRID_API_KEY=your-sendgrid-api-key-here
KICKBOX_API_KEY=your-kickbox-api-key-here
SENDER_EMAIL=your-email@domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-name.onrender.com
```

### **Frontend (React) - 3 Variables:**
```bash
VITE_API_URL=https://your-backend-name.onrender.com/api
VITE_APP_TITLE=Email Dashboard
VITE_APP_VERSION=1.0.0
```

### **Database (PostgreSQL) - 1 Variable:**
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

---

## 🎯 **Final URLs**

After deployment, you'll have:

- **Frontend**: `https://your-frontend-name.onrender.com`
- **Backend API**: `https://your-backend-name.onrender.com/api/`
- **Database**: Managed by Render (PostgreSQL)

---

## 🚨 **Troubleshooting**

### **Backend Issues:**
1. **Check build logs** in Render dashboard
2. **Verify environment variables** are set correctly
3. **Check database connection** in logs

### **Frontend Issues:**
1. **Check build logs** in Render dashboard
2. **Verify API URL** is correct
3. **Check browser console** for errors

### **Database Issues:**
1. **Check database status** in Render dashboard
2. **Verify DATABASE_URL** is correct
3. **Check database logs**

---

## 📊 **Cost Breakdown**

### **Free Tier (Perfect for testing):**
- **Backend**: 750 hours/month (enough for full month)
- **Frontend**: Unlimited static hosting
- **Database**: 1GB PostgreSQL

### **Total Cost: $0/month** 🎉

---

## 🎊 **Success Checklist**

- [ ] PostgreSQL database created
- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] CORS settings updated
- [ ] API endpoints working
- [ ] Frontend loading correctly
- [ ] Email sending working
- [ ] Campaign logs displaying

**Your Email Dashboard is now live on the internet!** 🚀

---

## 📞 **Need Help?**

If you encounter issues:
1. **Check the logs** in Render dashboard
2. **Verify all environment variables** are set
3. **Test each component** separately
4. **Check the troubleshooting section** above

**Follow this guide step by step, and you'll have a fully functional Email Dashboard deployed!** 🎉
