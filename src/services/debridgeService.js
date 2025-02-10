const { evm } = require("@debridge-finance/desdk");
const { BRIDGES } = require("../config/constants");

class DeBridgeService {
  constructor() {
    this.contractAddress = BRIDGES.DEBRIDGE.contractAddress;
  }

  async createMessage(params) {
    try {
      const message = new evm.Message({
        tokenAddress: params.sourceToken,
        amount: params.amount,
        chainIdTo: params.destChain,
        receiver: params.receiver,
        autoParams: new evm.SendAutoParams({
          executionFee: "0",
          fallbackAddress: params.receiver,
          flags: new evm.Flags(),
          data: "0x",
        }),
      });

      return message.getEncodedArgs();
    } catch (error) {
      console.error("DeBridge message error:", error);
      return null;
    }
  }

  async findSubmissions(txHash, context) {
    try {
      const submissions = await evm.Submission.findAll(txHash, context);
      return submissions;
    } catch (error) {
      console.error("Error finding submissions:", error);
      return null;
    }
  }
}

module.exports = new DeBridgeService();
