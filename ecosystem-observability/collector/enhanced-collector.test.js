/**
 * Tests for Enhanced Ecosystem Collector
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { EcosystemCollector } from './enhanced-collector.js';

describe('EcosystemCollector', () => {
  let collector;
  const testToken = process.env.GITHUB_TOKEN || 'test-token';

  beforeEach(() => {
    collector = new EcosystemCollector(testToken);
  });

  describe('groupByLanguage', () => {
    it('should group repositories by language', () => {
      const repos = [
        { name: 'repo1', language: 'JavaScript', stars: 100 },
        { name: 'repo2', language: 'Python', stars: 200 },
        { name: 'repo3', language: 'JavaScript', stars: 150 },
        { name: 'repo4', language: null, stars: 50 },
      ];

      const grouped = collector.groupByLanguage(repos);

      expect(grouped['JavaScript']).toHaveLength(2);
      expect(grouped['Python']).toHaveLength(1);
      expect(grouped['Unknown']).toHaveLength(1);
    });

    it('should sort repositories by stars within each language', () => {
      const repos = [
        { name: 'repo1', language: 'JavaScript', stars: 100 },
        { name: 'repo2', language: 'JavaScript', stars: 200 },
        { name: 'repo3', language: 'JavaScript', stars: 150 },
      ];

      const grouped = collector.groupByLanguage(repos);
      const jsRepos = grouped['JavaScript'];

      expect(jsRepos[0].stars).toBe(200);
      expect(jsRepos[1].stars).toBe(150);
      expect(jsRepos[2].stars).toBe(100);
    });
  });

  describe('getTopPerLanguage', () => {
    it('should return top N repositories per language', () => {
      const repos = Array.from({ length: 10 }, (_, i) => ({
        name: `repo${i}`,
        language: 'JavaScript',
        stars: i * 10,
      }));

      const top = collector.getTopPerLanguage(repos, 3);

      expect(top['JavaScript']).toHaveLength(3);
      expect(top['JavaScript'][0].stars).toBe(90);
      expect(top['JavaScript'][2].stars).toBe(70);
    });
  });

  describe('calculateAggregateStats', () => {
    it('should calculate correct aggregate statistics', () => {
      const repos = [
        {
          language: 'JavaScript',
          stars: 100,
          forks: 20,
          contributors: 5,
          openIssues: 10,
          openPRs: 2,
          hasReleases: true,
          archived: false,
        },
        {
          language: 'Python',
          stars: 200,
          forks: 30,
          contributors: 10,
          openIssues: 15,
          openPRs: 3,
          hasReleases: false,
          archived: true,
        },
      ];

      const stats = collector.calculateAggregateStats(repos);

      expect(stats.totalRepositories).toBe(2);
      expect(stats.totalStars).toBe(300);
      expect(stats.totalForks).toBe(50);
      expect(stats.totalContributors).toBe(15);
      expect(stats.totalOpenIssues).toBe(25);
      expect(stats.totalOpenPRs).toBe(5);
      expect(stats.repositoriesWithReleases).toBe(1);
      expect(stats.archivedRepositories).toBe(1);
      expect(stats.languageDistribution['JavaScript']).toBe(1);
      expect(stats.languageDistribution['Python']).toBe(1);
    });

    it('should handle repositories with missing data', () => {
      const repos = [
        {
          language: null,
          stars: undefined,
          forks: undefined,
        },
      ];

      const stats = collector.calculateAggregateStats(repos);

      expect(stats.totalRepositories).toBe(1);
      expect(stats.totalStars).toBe(0);
      expect(stats.totalForks).toBe(0);
      expect(stats.languageDistribution['Unknown']).toBe(1);
    });
  });

  describe('sleep', () => {
    it('should pause execution for specified milliseconds', async () => {
      const start = Date.now();
      await collector.sleep(100);
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(90); // Allow small margin
      expect(duration).toBeLessThan(150);
    });
  });
});
