/**
 * Tests for Data Storage
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { DataStorage } from './data-storage.js';
import fs from 'fs';
import path from 'path';

describe('DataStorage', () => {
  const testDataDir = './test-data';
  let storage;

  beforeEach(() => {
    // Create test storage instance
    storage = new DataStorage(testDataDir);
  });

  afterEach(() => {
    // Clean up test data directory
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  describe('ensureDataDirectory', () => {
    it('should create data directory if it does not exist', () => {
      expect(fs.existsSync(testDataDir)).toBe(true);
    });
  });

  describe('getTodayFilename', () => {
    it('should return filename in YYYY-MM-DD.json format', () => {
      const filename = storage.getTodayFilename();
      const basename = path.basename(filename);
      
      expect(basename).toMatch(/^\d{4}-\d{2}-\d{2}\.json$/);
    });
  });

  describe('saveSnapshot and loadSnapshot', () => {
    it('should save and load snapshot data correctly', () => {
      const testData = {
        topic: 'json-schema',
        repositories: [
          { name: 'test-repo', stars: 100 }
        ],
        aggregateStats: {
          totalRepositories: 1,
          totalStars: 100,
        },
        topPerLanguage: {},
      };

      const filename = storage.saveSnapshot(testData);
      expect(fs.existsSync(filename)).toBe(true);

      const loaded = storage.loadSnapshot(filename);
      expect(loaded).toBeTruthy();
      expect(loaded.metadata.topic).toBe('json-schema');
      expect(loaded.metadata.totalRepositories).toBe(1);
      expect(loaded.repositories).toHaveLength(1);
    });

    it('should return null for non-existent file', () => {
      const loaded = storage.loadSnapshot('non-existent.json');
      expect(loaded).toBeNull();
    });
  });

  describe('getAllSnapshots', () => {
    it('should return empty array when no snapshots exist', () => {
      const snapshots = storage.getAllSnapshots();
      expect(snapshots).toEqual([]);
    });

    it('should return sorted list of snapshot files', () => {
      // Create test snapshots
      const dates = ['2026-01-01', '2026-01-15', '2026-01-10'];
      
      for (const date of dates) {
        const filename = path.join(testDataDir, `${date}.json`);
        fs.writeFileSync(filename, JSON.stringify({ date }), 'utf8');
      }

      const snapshots = storage.getAllSnapshots();
      expect(snapshots).toHaveLength(3);
      
      // Should be sorted chronologically
      expect(path.basename(snapshots[0])).toBe('2026-01-01.json');
      expect(path.basename(snapshots[1])).toBe('2026-01-10.json');
      expect(path.basename(snapshots[2])).toBe('2026-01-15.json');
    });
  });

  describe('generateHistoricalSummary', () => {
    it('should generate correct historical summary from snapshots', () => {
      // Create test snapshots
      const testSnapshots = [
        {
          date: '2026-01-01',
          data: {
            aggregateStats: {
              totalRepositories: 100,
              totalStars: 1000,
              totalForks: 200,
            },
          },
        },
        {
          date: '2026-01-02',
          data: {
            aggregateStats: {
              totalRepositories: 105,
              totalStars: 1050,
              totalForks: 210,
            },
          },
        },
      ];

      for (const snapshot of testSnapshots) {
        const filename = path.join(testDataDir, `${snapshot.date}.json`);
        fs.writeFileSync(filename, JSON.stringify(snapshot.data), 'utf8');
      }

      const history = storage.generateHistoricalSummary();

      expect(history).toBeTruthy();
      expect(history.snapshotCount).toBe(2);
      expect(history.dateRange.start).toBe('2026-01-01');
      expect(history.dateRange.end).toBe('2026-01-02');
      expect(history.timeline).toHaveLength(2);
      expect(history.timeline[0].totalRepositories).toBe(100);
      expect(history.timeline[1].totalRepositories).toBe(105);
    });

    it('should return null when no snapshots exist', () => {
      const history = storage.generateHistoricalSummary();
      expect(history).toBeNull();
    });
  });

  describe('getLatestSnapshot', () => {
    it('should return the most recent snapshot', () => {
      // Create test snapshots
      const dates = ['2026-01-01', '2026-01-15', '2026-01-10'];
      
      for (const date of dates) {
        const filename = path.join(testDataDir, `${date}.json`);
        fs.writeFileSync(filename, JSON.stringify({ date, value: date }), 'utf8');
      }

      const latest = storage.getLatestSnapshot();
      expect(latest).toBeTruthy();
      expect(latest.value).toBe('2026-01-15');
    });

    it('should return null when no snapshots exist', () => {
      const latest = storage.getLatestSnapshot();
      expect(latest).toBeNull();
    });
  });
});
