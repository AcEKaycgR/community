# JSON Schema Ecosystem Data Collector

Automated data collection tool for tracking JSON Schema ecosystem metrics over time.

## Overview

This collector gathers comprehensive metrics from GitHub repositories tagged with the `json-schema` topic, including:

- Repository statistics (stars, forks, watchers)
- Contributor counts
- Issue and PR counts
- Release information
- Language distribution
- Activity metrics (creation date, last update, last push)

Data is stored as daily JSON snapshots, enabling longitudinal analysis of ecosystem growth and health.

## Prerequisites

- Node.js (v18 or higher)
- GitHub Personal Access Token with `public_repo` scope

## Installation

```bash
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your GitHub token:
```
GITHUB_TOKEN=your_github_token_here
```

## Usage

### Basic Collection

Collect data for all repositories with the `json-schema` topic:

```bash
npm start
```

### Command Line Options

```bash
# Specify a different topic
node main.js --topic=json-schema

# Limit number of repositories (useful for testing)
node main.js --max-repos=10

# Custom data directory
node main.js --data-dir=./custom-data

# Use a specific token
node main.js --github-token=ghp_xxxxx
```

### Environment Variables

All options can be configured via environment variables:

- `GITHUB_TOKEN` - GitHub Personal Access Token (required)
- `TOPIC` - GitHub topic to search (default: `json-schema`)
- `MAX_REPOS` - Maximum repositories to process (default: `-1` for unlimited)
- `DATA_DIR` - Directory for storing snapshots (default: `./data`)

## Data Structure

### Daily Snapshots

Each collection run creates a snapshot file: `data/YYYY-MM-DD.json`

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
    "totalOpenIssues": 500,
    "totalOpenPRs": 100,
    "languageDistribution": {
      "JavaScript": 400,
      "Python": 250,
      "TypeScript": 200
    },
    "repositoriesWithReleases": 800,
    "archivedRepositories": 50
  },
  "repositories": [...],
  "topPerLanguage": {...}
}
```

### Historical Summary

Aggregated data from all snapshots: `data/history.json`

```json
{
  "generatedAt": "2026-02-03T12:00:00.000Z",
  "snapshotCount": 30,
  "dateRange": {
    "start": "2026-01-01",
    "end": "2026-02-03"
  },
  "timeline": [
    {
      "date": "2026-01-01",
      "totalRepositories": 1200,
      "totalStars": 48000,
      "totalForks": 9500
    }
  ]
}
```

## Scheduling with GitHub Actions

See the `.github/workflows/collect-ecosystem-data.yml` file for automated weekly collection.

## Rate Limiting

The collector implements respectful rate limiting:
- 100ms delay between repository requests
- Graceful handling of API errors
- Continuation on individual repository failures

GitHub's API rate limit for authenticated requests is 5,000 requests per hour, which should be sufficient for ecosystem-wide collection.

## Development

### Project Structure

```
collector/
├── enhanced-collector.js  # Main data collection logic
├── data-storage.js        # JSON storage and historical aggregation
├── main.js                # CLI entry point
├── package.json           # Dependencies
├── .env.example           # Configuration template
└── README.md              # This file
```

### Adding New Metrics

To add new metrics, modify the `fetchRepositoryMetrics` method in `enhanced-collector.js`:

```javascript
async fetchRepositoryMetrics(owner, repo) {
  // Add your new metric collection here
  const newMetric = await this.fetchNewMetric(owner, repo);
  
  return {
    // ... existing metrics
    newMetric,
  };
}
```

## Troubleshooting

### Rate Limiting Issues

If you encounter rate limiting:
1. Reduce the collection frequency
2. Use `--max-repos` to limit the number of repositories
3. Check your rate limit status: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit`

### Authentication Errors

Ensure your GitHub token:
- Has `public_repo` scope
- Is correctly set in `.env` or passed via `--github-token`
- Has not expired

## License

MIT License - see the main repository LICENSE file.

## Contributing

This project is part of the JSON Schema GSoC 2026 initiative. Contributions are welcome!

For questions or issues, please visit: https://github.com/json-schema-org/community/issues/980
