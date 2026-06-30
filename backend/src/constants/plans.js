const PLANS = {
  STARTER: 'starter',
  GROWTH: 'growth',
  PRO: 'pro',
};

const PLAN_LIMITS = {
  starter: {
    postsPerMonth: 30,
    businesses: 1,
    campaigns: 2,
  },
  growth: {
    postsPerMonth: 150,
    businesses: 3,
    campaigns: 10,
  },
  pro: {
    postsPerMonth: Infinity,
    businesses: Infinity,
    campaigns: Infinity,
  },
};

module.exports = {
  PLANS,
  PLAN_LIMITS,
};
