# JSON Schema Ecosystem Observatory - Getting Started

## Initial Setup Guide

This guide will help you get the Ecosystem Observatory running for the first time.

### Step 1: Install Dependencies

```bash
# Install collector dependencies
cd ecosystem-observability/collector
npm install

# Install dashboard dependencies
cd ../dashboard
npm install
```

### Step 2: Configure GitHub Token

1. Create a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "JSON Schema Ecosystem Collector")
   - Select scopes: `public_repo` (minimum required)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again)

2. Create `.env` file in the collector directory:
   ```bash
   cd ecosystem-observability/collector
   cp .env.example .env
   ```

3. Edit `.env` and paste your token:
   ```
   GITHUB_TOKEN=ghp_your_actual_token_here
   TOPIC=json-schema
   MAX_REPOS=-1
   DATA_DIR=./data
   ```

### Step 3: Run Your First Collection

```bash
# From the collector directory
# Start with a small test run
node main.js --max-repos=10

# If successful, run full collection
node main.js
```

This will:
- Fetch all repositories with the `json-schema` topic
- Collect comprehensive metrics for each
- Save a snapshot in `data/YYYY-MM-DD.json`
- Generate `data/history.json`

### Step 4: View the Dashboard

```bash
# From the dashboard directory
cd ../dashboard
npm run dev
```

Open http://localhost:8080 in your browser to see your ecosystem observatory!

### Step 5: Set Up Automated Collection (Optional)

The project includes a GitHub Actions workflow that runs weekly. To enable:

1. Push this code to your GitHub repository
2. Enable GitHub Actions in your repository settings
3. The workflow will run automatically every Monday at 00:00 UTC
4. You can also trigger it manually from the Actions tab

### Troubleshooting

#### "No historical data available yet"
- Run the collector at least once: `cd collector && npm start`
- Check that `data/history.json` exists

#### Rate Limiting Issues
- Use `--max-repos=100` to limit collection during testing
- Check rate limit status: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit`
- Authenticated requests have a limit of 5,000/hour

#### Token Authentication Failed
- Verify token in `.env` file
- Ensure token has `public_repo` scope
- Check token hasn't expired

### Next Steps

Once you have data collected:

1. **Explore the dashboard** - View ecosystem trends and statistics
2. **Schedule regular collection** - Set up GitHub Actions or cron job
3. **Customize visualizations** - Edit `dashboard/dashboard.js` to add charts
4. **Share insights** - Deploy the dashboard to GitHub Pages

### Development Tips

**Testing Locally:**
```bash
# Quick test with 10 repos
cd collector
node main.js --max-repos=10

# View the generated data
cat data/$(ls -t data/*.json | head -1) | jq .aggregateStats
```

**Dashboard Development:**
```bash
# Auto-refresh during development
cd dashboard
npm run dev
# Edit HTML/CSS/JS and refresh browser
```

**Data Inspection:**
```bash
# View latest snapshot
cat collector/data/$(ls -t collector/data/*.json | head -1) | jq

# View historical summary
cat collector/data/history.json | jq
```

### Support

Questions? Issues? Reach out:
- GitHub Issues: https://github.com/json-schema-org/community/issues/980
- Slack: #gsoc channel on JSON Schema workspace

Happy observing! 🔭
