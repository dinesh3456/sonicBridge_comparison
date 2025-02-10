require("dotenv").config();

const CHAIN_IDS = {
  ETH: 1,
  POLYGON: 137,
  BSC: 56,
  ARBITRUM: 42161,
  AVALANCHE: 43114,
  OPTIMISM: 10,
  FANTOM: 250,
};

const CHAIN_NAMES = {
  [CHAIN_IDS.ETH]: "ETH",
  [CHAIN_IDS.POLYGON]: "POLYGON",
  [CHAIN_IDS.BSC]: "BSC",
  [CHAIN_IDS.ARBITRUM]: "ARBITRUM",
  [CHAIN_IDS.AVALANCHE]: "AVALANCHE",
  [CHAIN_IDS.OPTIMISM]: "OPTIMISM",
  [CHAIN_IDS.FANTOM]: "FANTOM",
};

module.exports = {
  BRIDGES: {
    CROSSCURVE: {
      name: "CrossCurve",
      contractAddress: "0x7A10F506E4c7658e6AD15Fdf0443d450B7FA80D7",
      apiUrl: process.env.CROSSCURVE_API_URL,
    },
    RUBIC: {
      name: "Rubic",
      contractAddress: "0xD8b19613723215EF8CC80fC35A1428f8E8826940",
      apiUrl: process.env.RUBIC_API_URL,
    },
  },
  CHAIN_IDS,
  CHAIN_NAMES,
};
