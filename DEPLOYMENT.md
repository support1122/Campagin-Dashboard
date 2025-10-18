# 🚀 Email Dashboard Deployment Guide

## 📋 **Quick Start**

### **1. Environment Variables**

#### **Backend (Django):**
```bash
SECRET_KEY=your-super-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-backend-name.onrender.com
DATABASE_URL=<provided by Render PostgreSQL>
SENDGRID_API_KEY=your-sendgrid-api-key-here
KICKBOX_API_KEY=your-kickbox-api-key-here
SENDER_EMAIL=your-email@domain.com
SENDGRID_TEMPLATE_ID=your-template-id-here
CORS_ALLOWED_ORIGINS=https://your-frontend-name.onrender.com
```

#### **Frontend (React):**
```bash
VITE_API_URL=https://your-backend-name.onrender.com/api
VITE_APP_TITLE=Email Dashboard
```

### **2. Render Deployment**

1. **Create PostgreSQL database on Render**
2. **Deploy backend service**
3. **Deploy frontend static site**
4. **Update CORS settings**

### **3. Environment Setup**

Replace all placeholder values with your actual:
- API keys
- Domain names
- Database credentials

**Your Email Dashboard is ready for deployment!** 🎉