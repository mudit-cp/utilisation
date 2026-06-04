# 🚀 BDE Utilization Dashboard - Deployment Guide

This guide will help you take the BDE Utilization Dashboard live with real-time data from your Redash API.

## 📋 Prerequisites

Before you start, ensure you have:
- ✅ GitHub account with the repository pushed
- ✅ Redash query set up with BDE data
- ✅ Redash API key (from Share → API Results)
- ✅ Python 3.6+ installed (for local testing)

---

## 🎯 Step 1: Prepare Your Redash API

### Get Your API URL

1. Go to your Redash dashboard
2. Open the BDE utilization query
3. Click **Share** → **Embed/Show SQL → API Results**
4. Copy the full URL with `api_key` parameter

Example:
```
https://data.testbook.com/api/queries/22653/results.json?api_key=OEvdupK6l18PK5ijC1qjLpDiJ7CCA5XuzczxnnU1
```

### Verify Query Format

Ensure your Redash query returns columns:
- `Activity_Date` or `Activity_Date::filter`
- `BD` (BDE email)
- `TotalCallAttempt`
- `Connected`
- `TotalCallDuration`
- `Vcdone`
- `Unique_Dailed`
- `Connected_Percent`

---

## 🔧 Step 2: Update Configuration

Edit `config.js` with your actual data:

```javascript
// Replace with your Redash API URL
const API_URL_DIRECT = "https://data.testbook.com/api/queries/YOUR_ID/results.json?api_key=YOUR_KEY";

// Update team mapping (email → team + targets)
const MAP = {
  "employee1@company.com": {
    "t": "Team Name",
    "g": "GOAL_CODE",
    "m": 1050000,        // Monthly target
    "w": [210000, 262500, 262500, 315000]  // Weekly targets
  }
  // Add more employees...
};
```

---

## 💻 Step 3: Test Locally

### Start the Development Server

```bash
# Clone and navigate to repo
git clone https://github.com/mudit-cp/utilisation.git
cd utilisation

# Start Python proxy server
python3 run-live.py
```

**Output:**
```
╔════════════════════════════════════════════════════════════╗
║  BDE Utilization Dashboard - Live Server                  ║
╠════════════════════════════════════════════════════════════╣
║  🌐 Server running at:                                     ║
║     http://localhost:8000/index.html                       ║
║                                                            ║
║  📊 API Proxy:                                             ║
║     http://localhost:8000/api/results                      ║
║                                                            ║
║  Press Ctrl+C to stop                                      ║
╚════════════════════════════════════════════════════════════╝
```

### Verify It Works

1. Open http://localhost:8000/index.html
2. Check if data loads (should show live indicator 🟢)
3. Verify metrics appear in KPI cards
4. Test filters, sorting, CSV export

### Troubleshooting Local

**CORS Error:**
```
Access to fetch... blocked by CORS policy
```
→ Make sure you're using `python3 run-live.py` (not opening HTML directly)

**No data appears:**
- Check Redash API URL in `config.js`
- Verify API key is valid
- Check browser console for errors

**Port 8000 already in use:**
```bash
PORT=8001 python3 run-live.py
```

---

## 🌐 Step 4: Deploy to Production

Choose your preferred deployment method:

### Option A: Railway.app (RECOMMENDED ⭐)

**Best for:** Easy setup, auto-scaling, free tier available

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Update Redash config"
   git push origin main
   ```

2. **Create Railway Project**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `mudit-cp/utilisation`
   - Railway auto-detects `run-live.py`

3. **Configure Environment (Optional)**
   - Railway automatically starts `python3 run-live.py`
   - No additional config needed

4. **Get Your URL**
   - Dashboard: `https://your-project.railway.app/index.html`
   - API: `https://your-project.railway.app/api/results`

5. **Custom Domain (Optional)**
   - In Railway Project Settings → Domain
   - Add custom domain (e.g., `utilisation.company.com`)

---

### Option B: Vercel/Netlify (Static Frontend Only)

**Best for:** Simple static hosting, CDN included

**Limitations:** No Python backend, must use direct Redash API (may have CORS issues)

1. **Deploy Frontend**
   ```bash
   # Using Netlify CLI
   npm install -g netlify-cli
   netlify deploy --prod --dir .
   ```

   OR connect GitHub repo to Vercel/Netlify dashboard directly

2. **Handle CORS**
   - Option 1: Use CORS proxy service
     ```javascript
     const API_URL_DIRECT = "https://cors-anywhere.herokuapp.com/https://data.testbook.com/api/queries/22653/results.json?api_key=YOUR_KEY";
     ```
   
   - Option 2: Deploy `run-live.py` separately to Railway, then use that URL
     ```javascript
     const API_PROXY = "https://your-railway-app.railway.app/api/results";
     ```

---

### Option C: Docker + Any Cloud Provider

**Best for:** Full control, scaling, enterprise deployments

1. **Build Docker Image**
   ```bash
   docker build -t bde-dashboard:latest .
   ```

2. **Test Locally**
   ```bash
   docker run -p 8000:8000 bde-dashboard:latest
   ```

3. **Push to Registry**
   ```bash
   # Docker Hub
   docker tag bde-dashboard:latest your-username/bde-dashboard
   docker push your-username/bde-dashboard
   
   # Or GitHub Container Registry
   docker push ghcr.io/mudit-cp/bde-dashboard:latest
   ```

4. **Deploy to Cloud**
   - **AWS ECS**: Upload image, create task
   - **Google Cloud Run**: Push to GCR, deploy
   - **Azure**: Push to ACR, create container instance
   - **DigitalOcean**: App Platform with Dockerfile

---

### Option D: Traditional VPS / Server

1. **SSH into server**
   ```bash
   ssh user@your-server.com
   ```

2. **Clone repo**
   ```bash
   git clone https://github.com/mudit-cp/utilisation.git
   cd utilisation
   ```

3. **Install Python dependencies** (if needed)
   ```bash
   pip3 install -r requirements.txt  # (not needed - no dependencies)
   ```

4. **Start with systemd**
   ```bash
   sudo nano /etc/systemd/system/bde-dashboard.service
   ```

   ```ini
   [Unit]
   Description=BDE Utilization Dashboard
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/home/username/utilisation
   ExecStart=/usr/bin/python3 /home/username/utilisation/run-live.py
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl enable bde-dashboard
   sudo systemctl start bde-dashboard
   sudo systemctl status bde-dashboard
   ```

5. **Reverse proxy with Nginx**
   ```nginx
   server {
       listen 80;
       server_name utilisation.company.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```

---

## 🔐 Security Checklist

- [ ] **Redash API Key**: Keep it secure, don't commit to public repo
  
  Use environment variables instead:
  ```javascript
  const API_URL_DIRECT = `https://data.testbook.com/api/queries/22653/results.json?api_key=${process.env.REDASH_API_KEY}`;
  ```

- [ ] **CORS**: In production, restrict CORS headers
  ```python
  self.send_header('Access-Control-Allow-Origin', 'https://yourdomain.com')
  ```

- [ ] **HTTPS**: Always use HTTPS in production (auto with Railway/Vercel)

- [ ] **Rate Limiting**: Consider adding rate limits if API calls spike
  ```python
  # In run-live.py
  from time import time
  last_fetch = 0
  if time() - last_fetch < 60:  # Min 1 min between requests
      return cached_data
  ```

---

## 📊 Monitoring & Updates

### Health Checks

Test your deployed dashboard:

```bash
# Check API endpoint
curl https://your-domain.com/api/results

# Verify dashboard loads
curl -I https://your-domain.com/index.html
```

### Update Redash Configuration

To update team mapping or thresholds after deployment:

1. Edit `config.js` locally
2. Commit and push to GitHub
3. Railway auto-redeploys on push
4. Refresh browser to see changes

### View Logs

**Railway:**
```bash
railway logs  # View live logs
```

**Systemd (VPS):**
```bash
sudo journalctl -u bde-dashboard -f  # Follow logs
```

---

## ✅ Post-Deployment Checklist

- [ ] Dashboard accessible from public URL
- [ ] Live data showing (🟢 indicator visible)
- [ ] All filters working (date, team, search)
- [ ] Leaderboard sorting works
- [ ] CSV export functions
- [ ] Team rollup displaying correctly
- [ ] Utilization calculations accurate
- [ ] Refresh happens every 5 minutes
- [ ] No console errors in browser
- [ ] Mobile responsive (test on phone)

---

## 🆘 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Live feed not reachable" | CORS blocked | Use proxy server or update config |
| No data appearing | Invalid API URL | Verify Redash query ID and API key |
| Metrics look wrong | Team mapping mismatch | Update MAP in config.js |
| Server crashes | Port in use | Change PORT in run-live.py |
| Slow dashboard | Large dataset | Filter in Redash query, optimize |

---

## 📞 Support & Maintenance

**For issues:**
1. Check browser console (F12 → Console tab)
2. Review troubleshooting section in README.md
3. Open GitHub issue with error details

**For updates:**
- Monitor Redash query changes
- Adjust thresholds based on team performance
- Update team mapping when reps join/leave

---

## 🎉 You're Live!

Your BDE Utilization Dashboard is now accessible to your entire team. Share the URL and let them monitor performance in real-time!

**Next steps:**
- 📌 Bookmark the dashboard
- 📧 Share URL with team leads
- 🔔 Set up alerts if needed
- 📈 Review metrics weekly

Good luck! 🚀
