const { WEIGHT_FACTORS } = require("../config/constants");

class BridgeScoring {
  calculateSpeedScore(processingTime) {
    // Lower processing time is better
    const maxProcessingTime = 300; // 5 minutes in seconds
    return Math.max(0, 1 - processingTime / maxProcessingTime);
  }

  calculateCostScore(fee, amount) {
    // Lower fee percentage is better
    const feePercentage = (fee / amount) * 100;
    return Math.max(0, 1 - feePercentage / 5); // 5% as maximum acceptable fee
  }

  calculateLiquidityScore(liquidity, amount) {
    // Higher liquidity ratio is better
    const liquidityRatio = liquidity / (amount * 10); // 10x amount as ideal liquidity
    return Math.min(1, liquidityRatio);
  }

  calculateReliabilityScore(successRate) {
    // Higher success rate is better
    return successRate / 100;
  }

  calculateTotalScore(metrics) {
    const speedScore = this.calculateSpeedScore(metrics.processingTime);
    const costScore = this.calculateCostScore(metrics.fee, metrics.amount);
    const liquidityScore = this.calculateLiquidityScore(
      metrics.liquidity,
      metrics.amount
    );
    const reliabilityScore = this.calculateReliabilityScore(
      metrics.successRate
    );

    return (
      speedScore * WEIGHT_FACTORS.SPEED +
      costScore * WEIGHT_FACTORS.COST +
      liquidityScore * WEIGHT_FACTORS.LIQUIDITY +
      reliabilityScore * WEIGHT_FACTORS.RELIABILITY
    );
  }
}

module.exports = new BridgeScoring();
