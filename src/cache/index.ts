import Logger from '../core/Logger';

// Mock Redis client that doesn't actually connect to Redis
const mockClient = {
  on: () => {},
  connect: async () => {
    Logger.info('Mock cache initialized');
    return Promise.resolve();
  },
  disconnect: async () => {
    Logger.info('Mock cache disconnected');
    return Promise.resolve();
  },
  exists: async (...keys: string[]) => false,
  set: async (key: string, value: string) => 'OK',
  get: async (key: string) => null,
  del: async (key: string) => 1,
  type: async (key: string) => 'none',
  pSetEx: async (key: string, milliseconds: number, value: string) => 'OK',
  multi: () => ({
    del: (key: string) => mockClient.multi(),
    rPush: (key: string, values: any[]) => mockClient.multi(),
    pExpireAt: (key: string, timestamp: number) => mockClient.multi(),
    exec: async () => [],
  }),
  rPushX: async (key: string, value: string) => 0,
  lRange: async (key: string, start: number, end: number) => [],
  zAdd: async (key: string, items: Array<{ score: number; value: string }>) =>
    0,
  zRem: async (key: string, members: string[]) => 0,
  zRangeWithScores: async (key: string, start: number, end: number) => [],
  zScore: async (key: string, member: string) => null,
  watch: async (key: string) => 'OK',
  unwatch: async () => 'OK',
  pExpireAt: async (key: string, timestamp: number) => 1,
  eval: async (script: string) => 0,
};

// Initialize the mock cache
(async () => {
  await mockClient.connect();
})();

// If the Node process ends, close the Cache connection
process.on('SIGINT', async () => {
  await mockClient.disconnect();
});

export default mockClient;
