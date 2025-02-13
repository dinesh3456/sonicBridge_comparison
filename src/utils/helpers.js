const { evm } = require("@debridge-finance/desdk");

function createDeBridgeContext(chainId, provider) {
  return {
    provider,
    chainId: chainId.toString(),
    // For local testing/development
    signatureStorage: new evm.DummySignatureStorage(),
  };
}

function formatAmount(amount, decimals = 18) {
  // Remove scientific notation and ensure proper decimal handling
  const num = typeof amount === "string" ? amount : amount.toString();
  return num.includes("e")
    ? Number(num).toLocaleString("fullwide", { useGrouping: false })
    : num;
}

module.exports = {
  createDeBridgeContext,
  formatAmount,
};
