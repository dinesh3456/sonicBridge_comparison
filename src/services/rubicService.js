const axios = require("axios");
const { BRIDGES, CHAIN_NAMES } = require("../config/constants");

class RubicService {
  constructor() {
    this.apiUrl = BRIDGES.RUBIC.apiUrl;
  }

  async getBestRoute(params) {
    try {
      // Format request body correctly
      const requestBody = {
        srcTokenAddress: params.sourceToken,
        dstTokenAddress: params.destToken,
        srcTokenAmount: params.amount,
        fromAddress: params.fromAddress,
        dstTokenBlockchain: CHAIN_NAMES[params.destChain],
        srcTokenBlockchain: CHAIN_NAMES[params.sourceChain],
        receiver: params.receiver || params.fromAddress,
        slippage: 0.5,
        referrer: "rubic.exchange",
      };

      console.log("Rubic Request:", JSON.stringify(requestBody, null, 2));

      // Get best quote
      const response = await axios.post(
        `${this.apiUrl}/routes/quoteBest`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Check if we got a valid response
      if (!response.data) {
        console.log("No data in Rubic response");
        return null;
      }

      const quoteData = response.data;

      // Get swap details if we have a valid quote
      let swapData = null;
      if (quoteData.id) {
        try {
          const swapResponse = await axios.post(
            `${this.apiUrl}/routes/swap`,
            {
              ...requestBody,
              id: quoteData.id,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          swapData = swapResponse.data;
        } catch (swapError) {
          console.warn("Failed to get swap data:", swapError.message);
        }
      }

      // Format response to match expected structure
      return {
        route: [
          {
            type: "cross-chain",
            provider: "rubic",
            ...quoteData,
          },
        ], // Ensure route is an array
        fee: quoteData.fee || "0",
        estimatedTime: quoteData.estimatedTime || 300,
        gas: quoteData.gasLimit || 500000,
        priceImpact: quoteData.priceImpact || 0,
        amountOut: quoteData.toTokenAmount || params.amount,
        totalCost:
          Number(quoteData.fee || "0") + Number(quoteData.gasLimit || 500000),
        swapTransaction: swapData?.transaction,
        providers: quoteData.providers || [],
      };
    } catch (error) {
      if (error.response?.data?.messages) {
        console.error("Rubic route error:", error.response.data.messages);
      } else if (error.response?.data?.message) {
        console.error("Rubic route error:", error.response.data.message);
      } else {
        console.error("Rubic route error:", error.message);
      }
      return null;
    }
  }
}

module.exports = RubicService;
