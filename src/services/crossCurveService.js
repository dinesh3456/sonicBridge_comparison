const axios = require("axios");
const { BRIDGES } = require("../config/constants");

class CrossCurveService {
  constructor() {
    this.apiUrl = "https://api.crosscurve.fi";
  }

  async getRoute(params) {
    try {
      // Following the exact format from documentation
      const requestData = {
        params: {
          chainIdIn: Number(params.sourceChain),
          chainIdOut: Number(params.destChain),
          tokenIn: params.sourceToken,
          tokenOut: params.destToken,
          amountIn: params.amount,
        },
        slippage: 0.5,
      };

      console.log("CrossCurve Request:", JSON.stringify(requestData, null, 2));

      const response = await axios({
        method: "post",
        url: `${this.apiUrl}/routing/scan`,
        data: requestData,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.data || !response.data[0]) {
        return null;
      }

      const routeData = response.data[0];
      return {
        route: routeData.route || [],
        fee: routeData.totalFee?.amount || 0,
        estimatedTime: 300,
        gas: routeData.gasEstimate || 500000,
        priceImpact: routeData.priceImpact || 0,
        amountOut: routeData.amountOut || params.amount,
        totalCost:
          Number(routeData.totalFee?.amount || 0) +
          Number(routeData.gasEstimate || 500000),
      };
    } catch (error) {
      console.error(
        "CrossCurve route error:",
        error.response?.data || error.message
      );
      return null;
    }
  }
}

module.exports = CrossCurveService;
