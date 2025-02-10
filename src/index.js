const CrossCurveService = require("./services/crossCurveService");
const RubicService = require("./services/rubicService");
const { BRIDGES } = require("./config/constants");

class BridgeComparison {
  constructor() {
    // Create new instances of the services
    this.crossCurve = new CrossCurveService();
    this.rubic = new RubicService();
  }

  async getBestBridge(params) {
    try {
      console.log(
        "Getting quotes for params:",
        JSON.stringify(params, null, 2)
      );

      // Get quotes from all bridges
      const [crossCurveQuote, rubicQuote] = await Promise.all([
        this.crossCurve.getRoute(params),
        this.rubic.getBestRoute(params),
      ]);

      // Compile results
      const bridges = [];

      if (crossCurveQuote) {
        bridges.push({
          name: BRIDGES.CROSSCURVE.name,
          quote: crossCurveQuote.route,
          metrics: {
            fee: crossCurveQuote.fee,
            estimatedTime: crossCurveQuote.estimatedTime,
            gas: crossCurveQuote.gas,
            priceImpact: crossCurveQuote.priceImpact,
            totalCost: crossCurveQuote.fee + crossCurveQuote.gas,
          },
        });
      }

      if (rubicQuote) {
        bridges.push({
          name: BRIDGES.RUBIC.name,
          quote: rubicQuote.route,
          metrics: {
            fee: rubicQuote.fee,
            estimatedTime: rubicQuote.estimatedTime,
            gas: rubicQuote.gas,
            priceImpact: rubicQuote.priceImpact,
            totalCost: rubicQuote.fee + rubicQuote.gas,
          },
        });
      }

      // Sort bridges by total cost
      bridges.sort((a, b) => a.metrics.totalCost - b.metrics.totalCost);

      return {
        bestBridge: bridges[0] || null,
        allBridges: bridges,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error getting best bridge:", error);
      return null;
    }
  }
}

module.exports = BridgeComparison;
