class MetricsTracker {
  constructor() {
    this.historicalData = {
      crossCurve: {
        averageProcessingTime: 180,
        successRate: 98,
        totalTransactions: 1000,
      },
      rubic: {
        averageProcessingTime: 200,
        successRate: 95,
        totalTransactions: 800,
      },
      debridge: {
        averageProcessingTime: 150,
        successRate: 97,
        totalTransactions: 900,
      },
    };
  }

  getHistoricalMetrics(bridgeName) {
    return this.historicalData[bridgeName.toLowerCase()] || null;
  }

  updateMetrics(bridgeName, newMetrics) {
    const bridge = bridgeName.toLowerCase();
    if (this.historicalData[bridge]) {
      this.historicalData[bridge] = {
        ...this.historicalData[bridge],
        ...newMetrics,
      };
    }
  }
}

module.exports = new MetricsTracker();
