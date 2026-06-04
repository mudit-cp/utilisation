# ⚡ Quick Start - 5 Minutes to Live

Get your BDE Utilization Dashboard running in 5 minutes.

## 🎯 For Impatient People

### Step 1: Get Your Redash API Key (1 min)
```
1. Open Redash
2. Find your BDE query
3. Click "Share" → "Embed/SQL" → Copy API URL
4. Paste into config.js line 4
```

### Step 2: Update Team Mapping (1 min)
Edit `config.js`, update the `MAP` object with your team structure:
```javascript
const MAP = {
  "name@company.com": {"t": "Your Team", "g": "ACCA", "m": 1050000}
};
```

### Step 3: Run Locally (1 min)
```bash
python3 run-live.py
# Open: http://localhost:8000/index.html
```

### Step 4: Deploy (2 min)
```bash
# Push to GitHub
git add .
git commit -m "Update config"
git push

# Go to Railway.app → New Project → Connect GitHub
# Select your repo → Deploy
# Done! ✅
```

---

## 📊 What You Get

```
🟢 Live Data         - Real-time from Redash (5-min refresh)
📈 Team Metrics      - Rollup by team lead
👥 Leaderboard       - Rep performance ranking
📊 KPI Cards         - Utilization %, occupancy, call rates
🎛️ Filters           - By date, team, rep name
📥 Export CSV        - Download current view
⚙️ Configurable      - Adjust models on the fly
```

---

## 🚀 Deploy Options Ranked (Easiest First)

### 1. Railway.app ⭐ (Easiest)
- Cost: Free tier included
- Setup time: 2 minutes
- Auto-scales
- Just connect GitHub, done

### 2. Vercel + CORS Proxy (Simple Frontend)
- Cost: Free
- Setup time: 3 minutes
- No backend needed
- May have CORS issues

### 3. Docker + Cloud (Flexible)
- Cost: Depends on provider
- Setup time: 10-15 minutes
- Full control
- Requires Docker knowledge

### 4. VPS (Traditional)
- Cost: $5-20/month
- Setup time: 30 minutes
- Full control
- Need Linux knowledge

---

## 🔗 Quick Links

- 📖 [Full Deployment Guide](DEPLOYMENT_GUIDE.md)
- 📚 [README](README.md)
- 🐛 [GitHub Issues](https://github.com/mudit-cp/utilisation/issues)

---

## ❓ FAQ

**Q: Do I need to pay?**
A: No, Railway has a free tier. Deploying is free.

**Q: How often does it update?**
A: Every 5 minutes automatically.

**Q: Can I customize the colors?**
A: Yes, edit CSS variables in index.html `<style>` tag.

**Q: Will it work on mobile?**
A: Yes, fully responsive design.

**Q: What if Redash is down?**
A: Shows cached snapshot + manual paste option.

**Q: Can I add more metrics?**
A: Yes, edit app.js KPI calculation and Redash query.

---

## 🆘 Something Broken?

1. **"Live feed not reachable"**
   - Update API URL in config.js
   - Run `python3 run-live.py`

2. **No data showing**
   - Verify email addresses in MAP match Redash data
   - Check date selector

3. **Wrong calculations**
   - Update work hours / call duration in settings
   - Verify team targets in config.js

4. **Port 8000 in use**
   - `PORT=8001 python3 run-live.py`

---

## ✅ You're Done!

Share the live URL with your team and start tracking utilization in real-time. 🎉

**Questions?** Open a GitHub issue or check DEPLOYMENT_GUIDE.md for detailed steps.
