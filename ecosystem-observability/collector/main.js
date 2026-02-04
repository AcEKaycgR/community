import { EcosystemCollector } from './enhanced-collector.js';
import { DataStorage } from './data-storage.js';
import dotenv from 'dotenv';
import minimist from 'minimist';

dotenv.config();

/**
 * Main execution function
 */
async function main() {
  // Parse command line arguments
  const args = minimist(process.argv.slice(2));
  
  const token = args['github-token'] || process.env.GITHUB_TOKEN;
  const topic = args['topic'] || process.env.TOPIC || 'json-schema';
  const maxRepos = args['max-repos'] || process.env.MAX_REPOS || -1;
  const dataDir = args['data-dir'] || process.env.DATA_DIR || './data';

  if (!token) {
    console.error('Error: GitHub token is required');
    console.error('Provide via --github-token argument or GITHUB_TOKEN environment variable');
    process.exit(1);
  }

  console.log('JSON Schema Ecosystem Observability Data Collector');
  console.log('==================================================');
  console.log(`Topic: ${topic}`);
  console.log(`Max repositories: ${maxRepos === -1 ? 'unlimited' : maxRepos}`);
  console.log(`Data directory: ${dataDir}`);
  console.log('');

  try {
    // Initialize collector and storage
    const collector = new EcosystemCollector(token);
    const storage = new DataStorage(dataDir);

    // Collect repository data
    console.log('Starting data collection...');
    const repositories = await collector.collectTopicRepositories(topic, maxRepos);
    console.log(`Collected data for ${repositories.length} repositories`);

    // Calculate aggregate statistics
    console.log('Calculating aggregate statistics...');
    const aggregateStats = collector.calculateAggregateStats(repositories);
    
    // Get top repositories per language
    console.log('Grouping repositories by language...');
    const topPerLanguage = collector.getTopPerLanguage(repositories, 5);

    // Save snapshot
    console.log('Saving snapshot...');
    const snapshotData = {
      topic,
      repositories,
      aggregateStats,
      topPerLanguage,
    };
    
    storage.saveSnapshot(snapshotData);

    // Generate and save historical summary
    console.log('Generating historical summary...');
    storage.saveHistoricalSummary();

    // Display summary
    console.log('');
    console.log('Collection Summary');
    console.log('==================');
    console.log(`Total repositories: ${aggregateStats.totalRepositories}`);
    console.log(`Total stars: ${aggregateStats.totalStars.toLocaleString()}`);
    console.log(`Total forks: ${aggregateStats.totalForks.toLocaleString()}`);
    console.log(`Total contributors: ${aggregateStats.totalContributors.toLocaleString()}`);
    console.log(`Open issues: ${aggregateStats.totalOpenIssues.toLocaleString()}`);
    console.log(`Open PRs: ${aggregateStats.totalOpenPRs.toLocaleString()}`);
    console.log(`Repositories with releases: ${aggregateStats.repositoriesWithReleases}`);
    console.log(`Archived repositories: ${aggregateStats.archivedRepositories}`);
    console.log('');
    console.log('Language distribution:');
    
    const sortedLanguages = Object.entries(aggregateStats.languageDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [lang, count] of sortedLanguages) {
      console.log(`  ${lang}: ${count}`);
    }

    console.log('');
    console.log('Data collection completed successfully!');
  } catch (error) {
    console.error('Error during data collection:', error);
    process.exit(1);
  }
}

// Run main function
main();
