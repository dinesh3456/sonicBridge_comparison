const EventEmitter = require("events");
const crossCurveService = require("../services/crossCurveService");
const rubicService = require("../services/rubicService");
const debridgeService = require("../services/debridgeService");

class BridgeMonitor extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      crossCurve: {
        successfulTransactions: 0,
        failedTransactions: 0,
        averageProcessingTime: 0,
        currentLiquidity: 0,
        isOperational: true,
        lastUpdated: Date.now(),
      },
      rubic: {
        successfulTransactions: 0,
        failedTransactions: 0,
        averageProcessingTime: 0,
        currentLiquidity: 0,
        isOperational: true,
        lastUpdated: Date.now(),
      },
      debridge: {
        successfulTransactions: 0,
        failedTransactions: 0,
        averageProcessingTime: 0,
        currentLiquidity: 0,
        isOperational: true,
        lastUpdated: Date.now(),
      },
    };

    this.monitoringInterval = null;
    this.transactionQueue = new Map();
  }

  async startMonitoring(interval = 30000) {
    // Default 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.checkBridgesHealth();
      await this.updateMetrics();
      this.emit("metricsUpdated", this.metrics);
    }, interval);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  async checkBridgesHealth() {
    try {
      // CrossCurve Health Check
      const crossCurveHealth = await this.checkCrossCurveHealth();
      this.metrics.crossCurve.isOperational = crossCurveHealth;

      // Rubic Health Check
      const rubicHealth = await this.checkRubicHealth();
      this.metrics.rubic.isOperational = rubicHealth;

      // DeBridge Health Check
      const debridgeHealth = await this.checkDeBridgeHealth();
      this.metrics.debridge.isOperational = debridgeHealth;
    } catch (error) {
      console.error("Error checking bridges health:", error);
    }
  }

  async trackTransaction(bridgeName, txHash) {
    this.transactionQueue.set(txHash, {
      bridge: bridgeName,
      startTime: Date.now(),
      status: "pending",
    });

    try {
      let status;
      switch (bridgeName.toLowerCase()) {
        case "crosscurve":
          status = await this.trackCrossCurveTransaction(txHash);
          break;
        case "rubic":
          status = await this.trackRubicTransaction(txHash);
          break;
        case "debridge":
          status = await this.trackDeBridgeTransaction(txHash);
          break;
      }

      this.updateTransactionMetrics(
        bridgeName,
        status,
        Date.now() - this.transactionQueue.get(txHash).startTime
      );
      this.transactionQueue.delete(txHash);
    } catch (error) {
      console.error(`Error tracking transaction ${txHash}:`, error);
      this.updateTransactionMetrics(bridgeName, "failed", 0);
    }
  }

  async checkCrossCurveHealth() {
    try {
      const testParams = {
        sourceChain: 1,
        destChain: 137,
        amount: "1000000000000000000",
      };
      const response = await crossCurveService.getRoute(testParams);
      return !!response;
    } catch (error) {
      return false;
    }
  }

  async checkRubicHealth() {
    try {
      const response = await rubicService.getAllRoutes({
        srcTokenBlockchain: "ETH",
        dstTokenBlockchain: "POLYGON",
      });
      return !!response;
    } catch (error) {
      return false;
    }
  }

  async checkDeBridgeHealth() {
    try {
      // Implement DeBridge specific health check
      return true; // Placeholder
    } catch (error) {
      return false;
    }
  }

  async updateMetrics() {
    // Update liquidity metrics
    await this.updateLiquidityMetrics();

    // Calculate average processing times
    this.calculateAverageProcessingTimes();

    // Update timestamp
    Object.keys(this.metrics).forEach((bridge) => {
      this.metrics[bridge].lastUpdated = Date.now();
    });
  }

  async updateLiquidityMetrics() {
    try {
      // Implementation for each bridge
      // CrossCurve
      const crossCurveLiquidity = await this.getCrossCurveLiquidity();
      this.metrics.crossCurve.currentLiquidity = crossCurveLiquidity;

      // Rubic
      const rubicLiquidity = await this.getRubicLiquidity();
      this.metrics.rubic.currentLiquidity = rubicLiquidity;

      // DeBridge
      const debridgeLiquidity = await this.getDeBridgeLiquidity();
      this.metrics.debridge.currentLiquidity = debridgeLiquidity;
    } catch (error) {
      console.error("Error updating liquidity metrics:", error);
    }
  }

  updateTransactionMetrics(bridge, status, processingTime) {
    const bridgeMetrics = this.metrics[bridge.toLowerCase()];

    if (status === "success") {
      bridgeMetrics.successfulTransactions++;
      if (processingTime > 0) {
        const totalTime =
          bridgeMetrics.averageProcessingTime *
            (bridgeMetrics.successfulTransactions - 1) +
          processingTime;
        bridgeMetrics.averageProcessingTime =
          totalTime / bridgeMetrics.successfulTransactions;
      }
    } else {
      bridgeMetrics.failedTransactions++;
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getHealthStatus() {
    return Object.keys(this.metrics).reduce((status, bridge) => {
      status[bridge] = {
        isOperational: this.metrics[bridge].isOperational,
        successRate: this.calculateSuccessRate(bridge),
        lastUpdated: this.metrics[bridge].lastUpdated,
      };
      return status;
    }, {});
  }

  calculateSuccessRate(bridge) {
    const metrics = this.metrics[bridge];
    const total = metrics.successfulTransactions + metrics.failedTransactions;
    return total > 0 ? (metrics.successfulTransactions / total) * 100 : 0;
  }
}

module.exports = new BridgeMonitor();
