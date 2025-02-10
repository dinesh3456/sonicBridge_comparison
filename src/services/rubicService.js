const axios = require("axios");
const { BRIDGES, CHAIN_NAMES } = require("../config/constants");

class RubicService {
  constructor() {
    this.apiUrl = BRIDGES.RUBIC.apiUrl;
  }

  async getBestRoute(params) {
    try {
      // Format amounts to string if they aren't already
      const srcAmount =
        typeof params.amount === "string"
          ? params.amount
          : params.amount.toString();

      const requestData = {
        params: {
          srcTokenAddress: params.sourceToken,
          dstTokenAddress: params.destToken,
          srcTokenAmount: srcAmount,
          fromAddress: params.fromAddress || params.receiver,
          receiver: params.receiver,
          referrer: "rubic.exchange",
          slippage: 0.5,
          // Use blockchain names from documentation
          srcTokenBlockchain: this.getBlockchainName(params.sourceChain),
          dstTokenBlockchain: this.getBlockchainName(params.destChain),
        },
      };

      console.log("Rubic Request:", JSON.stringify(requestData, null, 2));

      const response = await axios.post(
        `${this.apiUrl}/routes/quoteBest`,
        requestData
      );

      return this.parseRubicResponse(response.data);
    } catch (error) {
      console.error(
        "Rubic route error:",
        error.response?.data || error.message
      );
      return null;
    }
  }

  getBlockchainName(chainId) {
    // Map chain IDs to blockchain names as per Rubic documentation
    const chainMap = {
      1: "ETH",
      137: "POLYGON",
      56: "BSC",
      42161: "ARBITRUM",
      43114: "AVALANCHE",
      10: "OPTIMISM",
      250: "FANTOM",
    };
    return chainMap[chainId] || CHAIN_NAMES[chainId];
  }

  parseRubicResponse(data) {
    if (!data) return null;

    return {
      route: data.route || [],
      fee: data.route?.[0]?.totalFee?.amount || 0,
      estimatedTime: 300, // 5 minutes estimated
      gas:
        data.route?.[0]?.txs?.reduce(
          (total, tx) => total + (tx.gasFeeUsd || 0),
          0
        ) || 0,
      priceImpact: data.route?.[0]?.priceImpact || 0,
    };
  }
}

// Export the class instead of an instance
module.exports = RubicService;
