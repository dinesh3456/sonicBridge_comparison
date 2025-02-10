const axios = require("axios");
const { BRIDGES } = require("../config/constants");

class CrossCurveService {
  constructor() {
    this.apiUrl = BRIDGES.CROSSCURVE.apiUrl;
  }

  async getRoute(params) {
    try {
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
      const response = await axios.post(
        `${this.apiUrl}/routing/scan`,
        requestData
      );
      return this.parseCrossCurveResponse(response.data);
    } catch (error) {
      console.error(
        "CrossCurve route error:",
        error.response?.data || error.message
      );
      return null;
    }
  }

  parseCrossCurveResponse(data) {
    if (!data) return null;

    const fees =
      data.fees?.map((fee) => ({
        type: fee.type,
        amount: fee.amount,
        percent: fee.percent,
      })) || [];

    return {
      route: data.route,
      fee: fees.reduce((total, fee) => total + Number(fee.amount), 0),
      estimatedTime: 300, // 5 minutes estimated
      gas: data.gasEstimate || 0,
      priceImpact: data.priceImpact || 0,
    };
  }
}

// Export the class instead of an instance
module.exports = CrossCurveService;
