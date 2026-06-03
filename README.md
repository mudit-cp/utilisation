# BDE Utilization Dashboard

Live dashboard for tracking Business Development Executive (BDE) utilization metrics, powered by Redash API.

## 📊 Features

- **Real-time data** from Redash API with 5-minute refresh intervals
- **Team rollup** - Aggregated metrics by sales team
- **Individual performance** - BDE-level utilization tracking
- **Interactive filters** - By date, team, and rep name
- **Sortable leaderboard** - Click column headers to sort
- **Export to CSV** - Download current view as CSV
- **Occupancy modeling** - Configurable call duration and capacity settings
- **Status indicators** - On track / Watch / Behind color-coded statuses

## 🚀 Quick Start

### Option 1: Direct Redash URL (Browser)
1. Open `index.html` in your browser
2. Dashboard auto-fetches from Redash API
3. Live updates every 5 minutes

### Option 2: Local Development Server (Recommended)

**Prerequisites:**
- Python 3.6+

**Setup:**
```bash
# Clone the repository
git clone https://github.com/mudit-cp/utilisation.git
cd utilisation

# Start the local proxy server
python3 run-live.py
```

Then open: **http://localhost:8000/index.html**

The proxy server:
- ✓ Solves CORS issues
- ✓ Adds caching headers
- ✓ Fetches Redash data
- ✓ Serves static files

## 📁 Project Structure

```
├── index.html      # Main dashboard HTML & styles
├── config.js       # Redash API config & team mapping
├── app.js          # Dashboard logic & rendering
├── run-live.py     # CORS proxy server
└── README.md       # This file
```

## ⚙️ Configuration

### Update Redash API Key

Edit `config.js`:

```javascript
const API_URL_DIRECT = "https://data.testbook.com/api/queries/YOUR_QUERY_ID/results.json?api_key=YOUR_API_KEY";
```

Get your query results URL from Redash:
1. Run your query in Redash
2. Click "Share" → "API Results"
3. Copy the URL with `api_key` parameter

### Update Team Mapping

Edit the `MAP` object in `config.js` to match your team structure:

```javascript
const MAP = {
  "employee@company.com": {
    "t": "Team Name",      // Team name
    "g": "Goal",           // Goal code
    "m": 1050000,          // Monthly target in rupees
    "w": [210000, ...]     // Weekly targets
  }
};
```

### Customize Occupancy Model

On the dashboard, adjust:
- **Work hrs/day** - Net productive hours (default: 8h)
- **Connected min** - Average duration per connected call (default: 20m)
- **DNP/CB min** - Average duration per DNP/call-back attempt (default: 2.5m)
- **VC min** - Average duration per video call (default: 40m)

### Thresholds

- **Green ≥** - Utilization threshold for "On track" (default: 75%)
- **Amber ≥** - Utilization threshold for "Watch" (default: 50%)

## 🔧 Deployment Options

### Vercel / Netlify (Static Hosting)

1. Push to GitHub
2. Connect to Vercel/Netlify
3. Deploy automatically

⚠️ **Note:** Direct Redash API calls may fail due to CORS. You'll need to:
- Deploy `run-live.py` separately (e.g., on Railway, Heroku)
- OR use CORS proxy service like `https://cors-anywhere.herokuapp.com`
- OR ask Redash to enable CORS headers

### Railway.app (With Python Server)

1. Push repository to GitHub
2. Connect Railway to your repo
3. Railway auto-detects `run-live.py` and starts it
4. Access at `https://your-project.railway.app`

### Heroku (Deprecated but still works)

```bash
heroku create utilisation-dashboard
git push heroku main
heroku open
```

### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
EXPOSE 8000
CMD ["python3", "run-live.py"]
```

Build and run:
```bash
docker build -t utilisation-dashboard .
docker run -p 8000:8000 utilisation-dashboard
```

## 📊 Redash Query Format

Expected columns in Redash query:
- `Activity_Date` - Date (YYYY-MM-DD)
- `BD` - BDE email
- `TotalCallAttempt` - Total call attempts
- `Connected` - Connected calls
- `TotalCallDuration` - Total talk time (minutes)
- `Vcdone` - Video calls completed
- `Unique_Dailed` - Unique contacts
- `Connected_Percent` - Connection percentage

## 🎨 Metrics Explained

**Occupancy (minutes)** = 
- (Connected calls × 20 min) 
- + (DNP/CB attempts × 2.5 min) 
- + (Video calls × 40 min)

**Utilization %** = Occupancy ÷ Daily capacity (work hrs × 60)

**Status:**
- 🟢 **On track** - Utilization ≥ 75%
- 🟠 **Watch** - Utilization ≥ 50% and < 75%
- 🔴 **Behind** - Utilization < 50%
- ⚪ **Idle** - No calls on this date

## 🔌 API References

### GET /api/results (Proxy endpoint)
Returns latest Redash query results with CORS headers.

```bash
curl http://localhost:8000/api/results
```

### Direct Redash API
```bash
curl "https://data.testbook.com/api/queries/22653/results.json?api_key=YOUR_KEY"
```

## 📝 Notes

- Dashboard loads cached snapshot if Redash is unreachable
- Manual paste option for JSON results (for offline use)
- All calculations done client-side (no backend needed)
- Exports are based on current view (filtered/sorted)

## 🐛 Troubleshooting

**"Live feed not reachable"**
- Check Redash API URL in `config.js`
- Verify API key is valid
- Run `python3 run-live.py` to use proxy
- Check browser console for CORS errors

**Port 8000 already in use**
```bash
PORT=8001 python3 run-live.py
```

**No data appearing**
- Paste raw Redash JSON into the fallback textarea
- Check date selector - data may be from different dates
- Verify team filter - may be filtering all reps

## 📄 License

MIT

## 👥 Support

For issues or questions, open a GitHub issue.

---

**Built with ❤️ for Plutus Education**
