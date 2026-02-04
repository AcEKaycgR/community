import { Octokit } from 'octokit';

/**
 * Enhanced Ecosystem Data Collector
 * Collects comprehensive metrics for JSON Schema ecosystem repositories
 */

export class EcosystemCollector {
  constructor(token) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Fetch comprehensive repository metrics
   */
  async fetchRepositoryMetrics(owner, repo) {
    console.log(`Fetching metrics for ${owner}/${repo}`);
    
    try {
      // Get basic repository data
      const repoData = await this.octokit.request('GET /repos/{owner}/{repo}', {
        owner,
        repo,
      });

      // Get contributors count using pagination trick (last page)
      const contributorsCount = await this.fetchContributorsCount(owner, repo);

      // Get issue and PR counts
      const { openIssues, openPRs } = await this.fetchIssueAndPRCounts(owner, repo);

      return {
        repository: `${owner}/${repo}`,
        name: repoData.data.name,
        fullName: repoData.data.full_name,
        description: repoData.data.description,
        language: repoData.data.language,
        topics: repoData.data.topics || [],
        stars: repoData.data.stargazers_count,
        forks: repoData.data.forks_count,
        watchers: repoData.data.watchers_count,
        openIssues: openIssues,
        openPRs: openPRs,
        contributors: contributorsCount,
        createdAt: repoData.data.created_at,
        updatedAt: repoData.data.updated_at,
        pushedAt: repoData.data.pushed_at,
        defaultBranch: repoData.data.default_branch,
        license: repoData.data.license?.spdx_id || null,
        archived: repoData.data.archived,
        disabled: repoData.data.disabled,
        hasWiki: repoData.data.has_wiki,
        hasPages: repoData.data.has_pages,
        size: repoData.data.size,
      };
    } catch (error) {
      console.error(`Error fetching metrics for ${owner}/${repo}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch contributors count using pagination
   */
  async fetchContributorsCount(owner, repo) {
    try {
      const response = await this.octokit.request(
        'GET /repos/{owner}/{repo}/contributors',
        {
          owner,
          repo,
          per_page: 1,
          anon: true, // Include anonymous contributors
        }
      );

      // Extract last page number from Link header
      const linkHeader = response.headers.link;
      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);
        if (match) {
          return parseInt(match[1], 10);
        }
      }

      // If no pagination, return the count from the current response
      return response.data.length;
    } catch (error) {
      console.warn(`Could not fetch contributors for ${owner}/${repo}:`, error.message);
      return 0;
    }
  }

  /**
   * Fetch issue and PR counts separately
   */
  async fetchIssueAndPRCounts(owner, repo) {
    try {
      // Search for open issues (excluding PRs)
      const issuesResponse = await this.octokit.request(
        'GET /repos/{owner}/{repo}/issues',
        {
          owner,
          repo,
          state: 'open',
          per_page: 1,
        }
      );

      // Search for open PRs
      const prsResponse = await this.octokit.request(
        'GET /repos/{owner}/{repo}/pulls',
        {
          owner,
          repo,
          state: 'open',
          per_page: 1,
        }
      );

      const openIssuesLink = issuesResponse.headers.link;
      const openPRsLink = prsResponse.headers.link;

      let openIssues = issuesResponse.data.length;
      let openPRs = prsResponse.data.length;

      if (openIssuesLink) {
        const match = openIssuesLink.match(/page=(\d+)>; rel="last"/);
        if (match) {
          openIssues = parseInt(match[1], 10);
        }
      }

      if (openPRsLink) {
        const match = openPRsLink.match(/page=(\d+)>; rel="last"/);
        if (match) {
          openPRs = parseInt(match[1], 10);
        }
      }

      return { openIssues, openPRs };
    } catch (error) {
      console.warn(`Could not fetch issue/PR counts for ${owner}/${repo}:`, error.message);
      return { openIssues: 0, openPRs: 0 };
    }
  }

  /**
   * Fetch release information
   */
  async fetchReleaseInfo(owner, repo) {
    try {
      const response = await this.octokit.request(
        'GET /repos/{owner}/{repo}/releases',
        {
          owner,
          repo,
          per_page: 1,
        }
      );

      if (response.data.length > 0) {
        const latestRelease = response.data[0];
        return {
          hasReleases: true,
          latestRelease: latestRelease.tag_name,
          latestReleaseDate: latestRelease.published_at,
        };
      }

      return {
        hasReleases: false,
        latestRelease: null,
        latestReleaseDate: null,
      };
    } catch (error) {
      console.warn(`Could not fetch releases for ${owner}/${repo}:`, error.message);
      return {
        hasReleases: false,
        latestRelease: null,
        latestReleaseDate: null,
      };
    }
  }

  /**
   * Collect data for all repositories with a specific topic
   */
  async collectTopicRepositories(topic, maxRepos = -1) {
    console.log(`Collecting repositories with topic: ${topic}`);
    const repositories = [];
    
    const iterator = this.octokit.paginate.iterator(
      this.octokit.rest.search.repos,
      {
        q: `topic:${topic}`,
        sort: 'stars',
        order: 'desc',
        per_page: 100,
      }
    );

    let processedCount = 0;

    for await (const response of iterator) {
      for (const repo of response.data) {
        if (maxRepos !== -1 && processedCount >= maxRepos) {
          console.log(`Reached maximum repository limit: ${maxRepos}`);
          return repositories;
        }

        try {
          const metrics = await this.fetchRepositoryMetrics(
            repo.owner.login,
            repo.name
          );
          
          const releaseInfo = await this.fetchReleaseInfo(
            repo.owner.login,
            repo.name
          );

          repositories.push({
            ...metrics,
            ...releaseInfo,
          });

          processedCount++;
          console.log(`Processed ${processedCount} repositories`);

          // Rate limiting: pause briefly between requests
          await this.sleep(100);
        } catch (error) {
          console.error(`Failed to process ${repo.owner.login}/${repo.name}:`, error.message);
          // Continue with next repository instead of failing completely
        }
      }
    }

    return repositories;
  }

  /**
   * Group repositories by primary language
   */
  groupByLanguage(repositories) {
    const byLanguage = {};
    
    for (const repo of repositories) {
      const lang = repo.language || 'Unknown';
      if (!byLanguage[lang]) {
        byLanguage[lang] = [];
      }
      byLanguage[lang].push(repo);
    }

    // Sort each language group by stars
    for (const lang in byLanguage) {
      byLanguage[lang].sort((a, b) => b.stars - a.stars);
    }

    return byLanguage;
  }

  /**
   * Get top N repositories per language
   */
  getTopPerLanguage(repositories, topN = 5) {
    const byLanguage = this.groupByLanguage(repositories);
    const topPerLanguage = {};

    for (const lang in byLanguage) {
      topPerLanguage[lang] = byLanguage[lang].slice(0, topN);
    }

    return topPerLanguage;
  }

  /**
   * Calculate aggregate statistics
   */
  calculateAggregateStats(repositories) {
    const stats = {
      totalRepositories: repositories.length,
      totalStars: 0,
      totalForks: 0,
      totalContributors: 0,
      totalOpenIssues: 0,
      totalOpenPRs: 0,
      languageDistribution: {},
      repositoriesWithReleases: 0,
      archivedRepositories: 0,
    };

    for (const repo of repositories) {
      stats.totalStars += repo.stars || 0;
      stats.totalForks += repo.forks || 0;
      stats.totalContributors += repo.contributors || 0;
      stats.totalOpenIssues += repo.openIssues || 0;
      stats.totalOpenPRs += repo.openPRs || 0;

      if (repo.hasReleases) {
        stats.repositoriesWithReleases++;
      }

      if (repo.archived) {
        stats.archivedRepositories++;
      }

      const lang = repo.language || 'Unknown';
      stats.languageDistribution[lang] = (stats.languageDistribution[lang] || 0) + 1;
    }

    return stats;
  }

  /**
   * Sleep utility for rate limiting
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default EcosystemCollector;
