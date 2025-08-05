/* eslint-disable @typescript-eslint/no-unused-vars */
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
  exists: async (..._keys: string[]) => false,
  set: async (_key: string, _value: string) => 'OK',
  get: async (_key: string) => null,
  del: async (_key: string) => 1,
  type: async (_key: string) => 'none',
  pSetEx: async (_key: string, _milliseconds: number, _value: string) => 'OK',
  multi: () => ({
    del: (_key: string) => mockClient.multi(),
    rPush: (_key: string, _values: any[]) => mockClient.multi(),
    zAdd: (_key: string, _items: Array<{ score: number; value: string }>) =>
      mockClient.multi(),
    pExpireAt: (_key: string, _timestamp: number) => mockClient.multi(),
    exec: async () => [],
  }),
  rPushX: async (_key: string, _value: string) => 0,
  lRange: async (_key: string, _start: number, _end: number) => [],
  zAdd: async (_key: string, _items: Array<{ score: number; value: string }>) =>
    0,
  zRem: async (_key: string, _members: string[]) => 0,
  zRangeWithScores: async (_key: string, _start: number, _end: number) => [],
  zScore: async (_key: string, _member: string) => null,
  watch: async (_key: string) => 'OK',
  unwatch: async () => 'OK',
  pExpireAt: async (_key: string, _timestamp: number) => 1,
  eval: async (_script: string) => 0,
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
