# JSON Schema Ecosystem Observatory

Automated observability and reporting system for the JSON Schema ecosystem over time.

## 🎯 Overview

This project provides comprehensive tracking of the JSON Schema ecosystem on GitHub, including:

- **Automated Data Collection**: Weekly collection of repository metrics via GitHub Actions
- **Historical Tracking**: Time-series data stored as daily JSON snapshots
- **Interactive Dashboard**: Clean, minimal web interface for visualizing ecosystem health
- **Comprehensive Metrics**: Stars, forks, contributors, issues, PRs, releases, and language distribution

## 📊 Features

### Data Collector
- Fetches all repositories with `json-schema` topic
- Collects 15+ metrics per repository
- Handles rate limiting gracefully
- Stores data in structured JSON format
- Generates historical summaries automatically

### Dashboard
- Real-time ecosystem statistics
- Growth trends over time
- Language distribution charts
- Top repositories by language
- Activity metrics visualization
- Fully static (no backend required)

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- GitHub Personal Access Token ([create one](https://github.com/settings/tokens))

### Installation

1. **Clone the repository**
   ```bash
   cd community/ecosystem-observability
   ```

2. **Install collector dependencies**
   ```bash
   cd collector
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your GITHUB_TOKEN
   ```

4. **Run data collection**
   ```bash
   npm start
   ```

5. **View the dashboard**
   ```bash
   cd ../dashboard
   npm install
   npm run dev
   ```

   Open http://localhost:8080 in your browser

## 📁 Project Structure

```
ecosystem-observability/
├── collector/               # Data collection module
│   ├── enhanced-collector.js   # Main collector logic
│   ├── data-storage.js         # JSON storage manager
│   ├── main.js                 # CLI entry point
│   ├── package.json
│   ├── .env.example
│   ├── README.md
│   └── data/                   # Generated snapshots
│       ├── YYYY-MM-DD.json    # Daily snapshots
│       └── history.json        # Aggregated timeline
│
├── dashboard/              # Visualization dashboard
│   ├── index.html
│   ├── styles.css
│   ├── dashboard.js
│   ├── build.js
│   ├── package.json
│   └── dist/              # Built files for deployment
│
└── README.md              # This file
```

## 🔧 Configuration

### Collector Options

Configure via `.env` file or command-line arguments:

```bash
# Environment variables
GITHUB_TOKEN=your_token_here
TOPIC=json-schema
MAX_REPOS=-1              # -1 for unlimited
DATA_DIR=./data

# Command line
node main.js --topic=json-schema --max-repos=100
```

### GitHub Actions

The workflow runs weekly on Mondays at 00:00 UTC. To change:

Edit `.github/workflows/collect-ecosystem-data.yml`:
```yaml
schedule:
  - cron: '0 0 * * 1'  # Modify as needed
```

Manual trigger: Go to Actions tab → Collect Ecosystem Data → Run workflow

## 📈 Data Format

### Daily Snapshot (`YYYY-MM-DD.json`)

```json
{
  "collectedAt": "2026-02-03T12:00:00.000Z",
  "metadata": {
    "topic": "json-schema",
    "totalRepositories": 1234
  },
  "aggregateStats": {
    "totalRepositories": 1234,
    "totalStars": 50000,
    "totalForks": 10000,
    "totalContributors": 5000,
    "languageDistribution": {...}
  },
  "repositories": [...],
  "topPerLanguage": {...}
}
```

### Historical Summary (`history.json`)

```json
{
  "generatedAt": "2026-02-03T12:00:00.000Z",
  "snapshotCount": 30,
  "dateRange": {
    "start": "2026-01-01",
    "end": "2026-02-03"
  },
  "timeline": [...]
}
```

## 🎨 Dashboard Customization

The dashboard is built with vanilla JavaScript and Chart.js. No build step required for development.

### Adding New Charts

Edit `dashboard/dashboard.js`:

```javascript
function createMyNewChart() {
  const ctx = document.getElementById('my-chart');
  new Chart(ctx, {
    type: 'line',
    data: {...},
    options: {...}
  });
}
```

Add corresponding canvas in `index.html`:
```html
<canvas id="my-chart"></canvas>
```

### Styling

Modify `dashboard/styles.css`. CSS variables are defined in `:root`:

```css
:root {
  --primary-color: #1e3a8a;
  --secondary-color: #3b82f6;
  /* ... */
}
```

## 🤝 Contributing

This is a GSoC 2026 project. Contributions welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

### Testing the Collector

```bash
# Test with limited repos
cd collector
node main.js --max-repos=10

# Check generated data
ls -la data/
cat data/$(ls -t data/ | head -1)
```

### Testing the Dashboard

```bash
cd dashboard
npm run dev
# Visit http://localhost:8080
```

## 📝 Related Issues

- [GSoC 2026: Ecosystem Observability #980](https://github.com/json-schema-org/community/issues/980)
- [Proposal: JSON Schema Ecosystem Metrics #518](https://github.com/json-schema-org/community/issues/518)

## 🔍 Future Enhancements

Potential additions for future work:

- [ ] Package manager download statistics (npm, PyPI, Maven, etc.)
- [ ] Dependency graph analysis (direct vs transitive)
- [ ] Implementation compliance tracking (integration with Bowtie)
- [ ] Email/Slack notifications for significant changes
- [ ] Historical data archival strategy
- [ ] Multi-language support for dashboard
- [ ] Export to CSV/PDF reports

## 📄 License

MIT License - see the main repository LICENSE file.

## 🙏 Acknowledgments

- Original proposal by @benjagm in #518
- Mentored by @Relequestual
- Built as part of Google Summer of Code 2026
- Thanks to all JSON Schema community contributors

## 📞 Support

- GitHub Issues: [json-schema-org/community](https://github.com/json-schema-org/community/issues)
- Slack: [#gsoc channel](https://json-schema.slack.com/archives/C04MVQSRBRS)
- Documentation: [JSON Schema website](https://json-schema.org)

---

**Status**: Active Development | **GSoC 2026** | **JSON Schema Community**
