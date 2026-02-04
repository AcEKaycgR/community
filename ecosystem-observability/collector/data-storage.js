import fs from 'fs';
import path from 'path';

/**
 * Data Storage Manager
 * Handles JSON-based time-series data storage
 */

export class DataStorage {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.ensureDataDirectory();
  }

  /**
   * Ensure data directory exists
   */
  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log(`Created data directory: ${this.dataDir}`);
    }
  }

  /**
   * Get filename for today's snapshot
   */
  getTodayFilename() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(this.dataDir, `${today}.json`);
  }

  /**
   * Get filename for a specific date
   */
  getFilenameForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return path.join(this.dataDir, `${dateStr}.json`);
  }

  /**
   * Save snapshot data
   */
  saveSnapshot(data, filename = null) {
    const targetFile = filename || this.getTodayFilename();
    
    const snapshot = {
      collectedAt: new Date().toISOString(),
      metadata: {
        topic: data.topic || 'json-schema',
        totalRepositories: data.repositories?.length || 0,
      },
      aggregateStats: data.aggregateStats || {},
      repositories: data.repositories || [],
      topPerLanguage: data.topPerLanguage || {},
    };

    fs.writeFileSync(targetFile, JSON.stringify(snapshot, null, 2), 'utf8');
    console.log(`Saved snapshot to: ${targetFile}`);
    
    return targetFile;
  }

  /**
   * Load snapshot from file
   */
  loadSnapshot(filename) {
    if (!fs.existsSync(filename)) {
      console.warn(`Snapshot file not found: ${filename}`);
      return null;
    }

    const content = fs.readFileSync(filename, 'utf8');
    return JSON.parse(content);
  }

  /**
   * Get all snapshot files
   */
  getAllSnapshots() {
    const files = fs.readdirSync(this.dataDir)
      .filter(file => file.endsWith('.json') && file.match(/^\d{4}-\d{2}-\d{2}\.json$/))
      .sort();
    
    return files.map(file => path.join(this.dataDir, file));
  }

  /**
   * Load all snapshots
   */
  loadAllSnapshots() {
    const files = this.getAllSnapshots();
    return files.map(file => ({
      filename: path.basename(file),
      data: this.loadSnapshot(file),
    }));
  }

  /**
   * Generate historical summary
   * Aggregates data from all snapshots for trend analysis
   */
  generateHistoricalSummary() {
    const snapshots = this.loadAllSnapshots();
    
    if (snapshots.length === 0) {
      console.warn('No snapshots found for historical summary');
      return null;
    }

    const history = {
      generatedAt: new Date().toISOString(),
      snapshotCount: snapshots.length,
      dateRange: {
        start: snapshots[0].filename.replace('.json', ''),
        end: snapshots[snapshots.length - 1].filename.replace('.json', ''),
      },
      timeline: [],
    };

    for (const snapshot of snapshots) {
      const date = snapshot.filename.replace('.json', '');
      const stats = snapshot.data?.aggregateStats || {};
      
      history.timeline.push({
        date,
        totalRepositories: stats.totalRepositories || 0,
        totalStars: stats.totalStars || 0,
        totalForks: stats.totalForks || 0,
        totalContributors: stats.totalContributors || 0,
        totalOpenIssues: stats.totalOpenIssues || 0,
        totalOpenPRs: stats.totalOpenPRs || 0,
        repositoriesWithReleases: stats.repositoriesWithReleases || 0,
        archivedRepositories: stats.archivedRepositories || 0,
      });
    }

    return history;
  }

  /**
   * Save historical summary
   */
  saveHistoricalSummary() {
    const history = this.generateHistoricalSummary();
    
    if (!history) {
      return null;
    }

    const filename = path.join(this.dataDir, 'history.json');
    fs.writeFileSync(filename, JSON.stringify(history, null, 2), 'utf8');
    console.log(`Saved historical summary to: ${filename}`);
    
    return filename;
  }

  /**
   * Get latest snapshot
   */
  getLatestSnapshot() {
    const files = this.getAllSnapshots();
    
    if (files.length === 0) {
      return null;
    }

    return this.loadSnapshot(files[files.length - 1]);
  }

  /**
   * Export data for visualization
   * Creates a simplified format for dashboard consumption
   */
  exportForVisualization() {
    const history = this.generateHistoricalSummary();
    const latest = this.getLatestSnapshot();

    return {
      current: latest,
      historical: history,
      exportedAt: new Date().toISOString(),
    };
  }
}

export default DataStorage;
