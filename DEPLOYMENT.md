# 🚀 IGNITRON 2K26 — Complete Production Deployment Guide

This guide walks you through deploying the complete **Ignitron 2K26** application to production using **MongoDB Atlas** (cloud database) and **Render** (free cloud hosting) connected directly to your GitHub repository:
👉 [https://github.com/yashwanthyashu514/Ignitron2k26](https://github.com/yashwanthyashu514/Ignitron2k26)

---

## 📋 Architecture Overview
- **Frontend**: React + Vite (Cyber Aurora UI, Three.js canvas, responsive mobile views)
- **Backend**: Node.js + Express 5 (REST API, JWT authentication, PDF generation)
- **Database**: MongoDB Atlas (Cloud database cluster)
- **Hosting**: Render.com (All-in-one free tier with automatic HTTPS SSL)

---

## ⚡ STEP 1: Set Up Free Cloud Database (MongoDB Atlas)
*(Estimated time: 3 minutes)*

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and Sign Up / Log In.
2. Click **Create Deployment** → Select the **M0 Free Cluster**.
   - **Provider**: AWS
   - **Region**: Mumbai (`ap-south-1`) or Singapore (`ap-southeast-1`) for lowest latency in India.
3. Under **Security Quickstart**:
   - Create a **Username** (e.g. `ignitron_admin`) and a **Password** (save this password!).
   - Under **Where would you like to connect from?**:
     - Select **IP Access List** → Add IP: `0.0.0.0/0` (Description: *Allow from anywhere*). This allows Render to connect.
4. Click **Connect** → Choose **Drivers** (Node.js).
5. Copy your connection string. It will look like:
   ```text
   mongodb+srv://ignitron_admin:<password>@cluster0.abcde.mongodb.net/ignitron2k26?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your database user password, and add `/ignitron2k26` before `?`)*.

---

## 📦 STEP 2: Commit & Push Code to GitHub

Open your terminal in `e:\Ignitron2k26-main` and run:

```bash
# 1. Stage all project files
git add .

# 2. Commit with descriptive message
git commit -m "feat: complete production release with cyber aurora design, mobile responsiveness, and deployment config"

# 3. Push to your main branch
git push origin main
```

---

## 🌐 STEP 3: Deploy Fullstack App on Render.com (100% Free)
*(Estimated time: 3 minutes)*

Render is the recommended platform because it runs both the Node.js API and serves the compiled React frontend from a single URL with free SSL.

1. Go to [Render.com](https://render.com) and click **Get Started** / **Sign In with GitHub**.
2. From the Render Dashboard, click **New +** → select **Web Service**.
3. Select your repository: **`yashwanthyashu514/Ignitron2k26`** (click *Connect*).
4. Fill in the service configuration:
   - **Name**: `ignitron2k26`
   - **Region**: `Singapore` (fastest for India)
   - **Branch**: `main`
   - **Root Directory**: *(Leave empty)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Scroll down to **Environment Variables** and add the following keys:
   | Key | Value | Note |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production mode and static serving |
   | `MONGODB_URI` | `mongodb+srv://...` | Paste your MongoDB Atlas URI from Step 1 |
   | `JWT_SECRET` | `ignitron_2k26_production_secret_key_gmusa` | Any secure random string |
   | `PORT` | `10000` | Port automatically managed by Render |

6. Click **Deploy Web Service** at the bottom.
7. Render will automatically:
   - Install dependencies
   - Compile the React frontend (`dist/`)
   - Start the Express server
   - Seed the initial 29 events and Super Admin account into your MongoDB Atlas database!
8. Once finished, you will see a green **"Live"** badge and your official public URL:
   **`https://ignitron2k26.onrender.com`** (or your custom domain).

---

## 👥 STEP 4: Seed the 28 Event Coordinators into Atlas

To seed all 28 coordinator accounts (with username `<Event Name> <Coordinator Name>` and phone number password) into your cloud database:

### Option A: From your local machine
In your local `.env` file, temporarily set `MONGODB_URI` to your MongoDB Atlas connection string, then run:
```bash
node scripts/seedCoordinators.js
```
All 28 official coordinator accounts will immediately be created in your cloud database!

### Option B: Via Render Shell
In your Render Dashboard, go to your service → click **Shell** in the left menu, and run:
```bash
node scripts/seedCoordinators.js
```

---

## 🔑 Production Credentials Reference

### 👑 Super Admin (Full Master Access)
- **Portal URL**: `https://<your-render-url>/admin`
- **Username**: `IgnitronGMUSA2026` *(or `ignitron2k26`)*
- **Password**: `ignitron2k26` *(or `IgnitronGMUSA2026`)*

### 🎯 Event Coordinators (Event-Isolated Access)
- **Portal URL**: `https://<your-render-url>/admin`
- **Username**: `<Event Name> <Coordinator Name>` *(case-insensitive)*
- **Password**: `<Coordinator Phone Number>`

---

## 🔄 Alternative: Deploying on Railway.app
If you prefer Railway:
1. Go to [railway.app](https://railway.app) → Click **New Project** → **Deploy from GitHub repo**.
2. Select `yashwanthyashu514/Ignitron2k26`.
3. In Variables, add `MONGODB_URI`, `JWT_SECRET`, and `NODE_ENV=production`.
4. Railway will automatically build and assign a domain (`xxx.up.railway.app`).
