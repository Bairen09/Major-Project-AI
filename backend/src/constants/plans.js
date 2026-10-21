// src/constants/plans.js

const PLANS = {
  FREE: {
    maxBusinesses: 1,
    maxPostsPerDay: 5,
  },
  STARTER: {
    maxBusinesses: 3,
    maxPostsPerDay: 20,
  },
  PRO: {
    maxBusinesses: 10,
    maxPostsPerDay: 100,
  },
  AGENCY: {
    maxBusinesses: -1,
    maxPostsPerDay: -1,
  },
};

module.exports = PLANS;
