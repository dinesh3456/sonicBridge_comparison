const { evm } = require("@debridge-finance/desdk");
const { BRIDGES } = require("../config/constants");

class DeBridgeService {
  constructor() {
    this.contractAddress = BRIDGES.DEBRIDGE.contractAddress;
  }

  async getRoute(params) {
    try {
      console.log("DeBridge Request:", JSON.stringify(params, null, 2));

      // Create message without submission tracking since we don't have a provider
      const message = new evm.Message({
        tokenAddress: params.sourceToken,
        amount: params.amount,
        chainIdTo: params.destChain.toString(),
        receiver: params.receiver,
        autoParams: new evm.SendAutoParams({
          executionFee: "0",
          fallbackAddress: params.receiver,
          flags: new evm.Flags(),
          data: "0x",
        }),
      });

      // Get encoded arguments
      const argsForSend = message.getEncodedArgs();

      return {
        route: argsForSend,
        fee: "0",
        estimatedTime: 300,
        gas: 500000,
        priceImpact: 0,
        amountOut: params.amount,
        totalCost: 500000,
      };
    } catch (error) {
      console.error("DeBridge route error:", error);
      return null;
    }
  }
}

module.exports = DeBridgeService;
