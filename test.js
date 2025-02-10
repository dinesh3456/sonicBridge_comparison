const BridgeComparison = require("./src/index");
const { CHAIN_IDS } = require("./src/config/constants");

async function test() {
  const bridgeComparison = new BridgeComparison();

  // Test parameters
  const testParams = {
    sourceChain: CHAIN_IDS.ETH,
    destChain: CHAIN_IDS.POLYGON,
    sourceToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    destToken: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", // WETH on Polygon
    amount: "1000000000000000000", // 1 ETH
    fromAddress: "0x7A10F506E4c7658e6AD15Fdf0443d450B7FA80D7",
    receiver: "0x7A10F506E4c7658e6AD15Fdf0443d450B7FA80D7",
  };

  console.log("Starting bridge comparison test...");
  console.log("Test Parameters:", JSON.stringify(testParams, null, 2));

  try {
    // Get best bridge
    const result = await bridgeComparison.getBestBridge(testParams);
    console.log("Bridge Comparison Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Test error:", error);
  }
}

test().catch(console.error);
