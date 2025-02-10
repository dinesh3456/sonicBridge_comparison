class MetricsAggregator {
  constructor() {
    this.historicalMetrics = new Map();
    this.timeWindows = {
      HOUR: 3600000,
      DAY: 86400000,
    };
  }

  addMetric(bridgeName, metric) {
    const timestamp = Date.now();
    if (!this.historicalMetrics.has(bridgeName)) {
      this.historicalMetrics.set(bridgeName, []);
    }

    const metrics = this.historicalMetrics.get(bridgeName);
    metrics.push({ timestamp, ...metric });

    // Clean up old metrics
    this.cleanup(bridgeName);
  }

  cleanup(bridgeName) {
    const dayAgo = Date.now() - this.timeWindows.DAY;
    const metrics = this.historicalMetrics.get(bridgeName);
    const filteredMetrics = metrics.filter((m) => m.timestamp > dayAgo);
    this.historicalMetrics.set(bridgeName, filteredMetrics);
  }

  getAverages(bridgeName, timeWindow = this.timeWindows.HOUR) {
    const metrics = this.historicalMetrics.get(bridgeName) || [];
    const threshold = Date.now() - timeWindow;
    const recentMetrics = metrics.filter((m) => m.timestamp > threshold);

    if (recentMetrics.length === 0) return null;

    return {
      averageProcessingTime: this.calculateAverage(
        recentMetrics,
        "processingTime"
      ),
      averageLiquidity: this.calculateAverage(recentMetrics, "liquidity"),
      successRate: this.calculateSuccessRate(recentMetrics),
      totalTransactions: recentMetrics.length,
    };
  }

  calculateAverage(metrics, key) {
    return metrics.reduce((sum, m) => sum + (m[key] || 0), 0) / metrics.length;
  }

  calculateSuccessRate(metrics) {
    const successful = metrics.filter((m) => m.status === "success").length;
    return (successful / metrics.length) * 100;
  }
}

module.exports = new MetricsAggregator();
