const CrossCurveService = require("./services/crossCurveService");
const RubicService = require("./services/rubicService");
const DeBridgeService = require("./services/debridgeService");
const { BRIDGES } = require("./config/constants");

class BridgeComparison {
  constructor() {
    this.crossCurve = new CrossCurveService();
    this.rubic = new RubicService();
    this.deBridge = new DeBridgeService();
  }

  weiToEth(wei) {
    return parseFloat(wei) / 1e18;
  }

  formatEth(eth, decimals = 6) {
    return Number(eth).toFixed(decimals);
  }

  calculateNetReturn(metrics) {
    const outputAmount = this.weiToEth(metrics.amountOut);
    const totalCost = this.weiToEth(metrics.fee) + metrics.gas / 1e9;
    return outputAmount - totalCost;
  }

  formatPercentage(value, base) {
    return ((value / base) * 100).toFixed(2);
  }

  formatMetrics(metrics) {
    const gasInEth = metrics.gas / 1e9;
    const feeInEth = this.weiToEth(metrics.fee);
    const outputInEth = this.weiToEth(metrics.amountOut);
    const totalCost = feeInEth + gasInEth;
    const netReturn = outputInEth - totalCost;

    return {
      fee: feeInEth,
      estimatedTime: metrics.estimatedTime,
      gas: gasInEth,
      priceImpact: metrics.priceImpact,
      totalCost: totalCost,
      amountOut: outputInEth,
      netReturn: netReturn,
    };
  }

  async getBestBridge(params) {
    try {
      console.log(
        "Getting quotes for params:",
        JSON.stringify(params, null, 2)
      );
      const inputAmount = this.weiToEth(params.amount);
      console.log(`\nInput Amount: ${this.formatEth(inputAmount)} ETH`);

      const [crossCurveQuote, rubicQuote, deBridgeQuote] =
        await Promise.allSettled([
          this.crossCurve.getRoute(params),
          this.rubic.getBestRoute(params),
          this.deBridge.getRoute(params),
        ]);

      const bridges = [];

      // Only add bridges with valid quotes
      if (
        crossCurveQuote.status === "fulfilled" &&
        crossCurveQuote.value &&
        crossCurveQuote.value.route?.length > 0
      ) {
        bridges.push({
          name: BRIDGES.CROSSCURVE.name,
          quote: crossCurveQuote.value.route,
          metrics: this.formatMetrics(crossCurveQuote.value),
        });
      }

      if (
        rubicQuote.status === "fulfilled" &&
        rubicQuote.value &&
        rubicQuote.value.route?.length > 0
      ) {
        bridges.push({
          name: BRIDGES.RUBIC.name,
          quote: rubicQuote.value.route,
          metrics: this.formatMetrics(rubicQuote.value),
        });
      }

      if (
        deBridgeQuote.status === "fulfilled" &&
        deBridgeQuote.value &&
        deBridgeQuote.value.route
      ) {
        bridges.push({
          name: BRIDGES.DEBRIDGE.name,
          quote: deBridgeQuote.value.route,
          metrics: this.formatMetrics(deBridgeQuote.value),
        });
      }

      // Sort by net return (output - costs)
      bridges.sort((a, b) => b.metrics.netReturn - a.metrics.netReturn);

      console.log("\nBridge Comparison Results:");
      console.log("========================");

      const bestMetrics = bridges[0]?.metrics;

      bridges.forEach((bridge) => {
        const { metrics } = bridge;
        const slippage = (
          ((inputAmount - metrics.amountOut) / inputAmount) *
          100
        ).toFixed(3);
        const efficiency = ((metrics.netReturn / inputAmount) * 100).toFixed(2);

        console.log(`\n${bridge.name}:`);
        console.log(`Output Amount: ${this.formatEth(metrics.amountOut)} ETH`);
        console.log(`Bridge Fee: ${this.formatEth(metrics.fee)} ETH`);
        console.log(`Gas Cost: ${this.formatEth(metrics.gas)} ETH`);
        console.log(`Total Cost: ${this.formatEth(metrics.totalCost)} ETH`);
        console.log(`Net Return: ${this.formatEth(metrics.netReturn)} ETH`);
        console.log(`Slippage: ${slippage}%`);
        console.log(`Efficiency: ${efficiency}%`);
        console.log(`Time Estimate: ${metrics.estimatedTime} seconds`);
      });

      if (bridges.length > 1) {
        const bestBridge = bridges[0];
        const secondBest = bridges[1];
        const savingsAmount =
          bestBridge.metrics.netReturn - secondBest.metrics.netReturn;
        const savingsPercent = (
          (savingsAmount / secondBest.metrics.netReturn) *
          100
        ).toFixed(2);

        console.log(`\nBest Bridge: ${bestBridge.name}`);
        console.log(
          `Savings vs Next Best: ${this.formatEth(
            savingsAmount
          )} ETH (${savingsPercent}%)`
        );
      } else if (bridges.length === 1) {
        console.log(`\nBest Bridge: ${bridges[0].name} (Only Valid Option)`);
      } else {
        console.log("\nNo valid bridges found");
      }

      return {
        bestBridge: bridges[0] || null,
        allBridges: bridges,
        timestamp: Date.now(),
        comparison: bridges.map((bridge) => ({
          name: bridge.name,
          metrics: {
            outputAmount: `${this.formatEth(bridge.metrics.amountOut)} ETH`,
            fee: `${this.formatEth(bridge.metrics.fee)} ETH`,
            gasCost: `${this.formatEth(bridge.metrics.gas)} ETH`,
            totalCost: `${this.formatEth(bridge.metrics.totalCost)} ETH`,
            netReturn: `${this.formatEth(bridge.metrics.netReturn)} ETH`,
            slippage: `${(
              ((inputAmount - bridge.metrics.amountOut) / inputAmount) *
              100
            ).toFixed(3)}%`,
            efficiency: `${(
              (bridge.metrics.netReturn / inputAmount) *
              100
            ).toFixed(2)}%`,
            estimatedTime: `${bridge.metrics.estimatedTime} seconds`,
          },
        })),
      };
    } catch (error) {
      console.error("Error getting best bridge:", error);
      return null;
    }
  }
}

module.exports = BridgeComparison;
