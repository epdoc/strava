import * as FS from '@epdoc/fs/fs';
import { assertEquals, assertRejects } from '@std/assert';
import { isValidCredData, StravaCreds } from '../src/auth/creds.ts';
import type { StravaCredsData } from '../src/types.ts';

const mockDate = 1678886400;

class MockFile extends FS.File {
  #content: unknown | undefined;
  #exists: boolean;

  constructor(path: string, exists: boolean = false, content: unknown = undefined) {
    super(path);
    this.#exists = exists;
    this.#content = content;
  }

  override isFile(): Promise<boolean> {
    return Promise.resolve(this.#exists);
  }

  override readJson<T>(): Promise<T> {
    if (!this.#exists) {
      return Promise.reject(new Error('File does not exist'));
    }
    return Promise.resolve(this.#content as T);
  }

  override writeJson(data: unknown): Promise<this> {
    this.#content = data;
    this.#exists = true;
    return Promise.resolve(this);
  }

  override get path(): FS.FilePath {
    return super.path as FS.FilePath;
  }
}

Deno.test('isValidCredData should return true for valid cred data', () => {
  const validData: StravaCredsData = {
    token_type: 'Bearer',
    expires_at: mockDate + 3600,
    expires_in: 3600,
    refresh_token: 'refresh123',
    access_token: 'access123',
    athlete: { id: 123 },
  };
  assertEquals(isValidCredData(validData), true);
});

Deno.test('isValidCredData should return false for invalid token_type', () => {
  const invalidData = {
    token_type: 'Other',
    expires_at: Date.now() / 1000 + 3600,
    expires_in: 3600,
    refresh_token: 'refresh123',
    access_token: 'access123',
    athlete: { id: '123' },
  };
  assertEquals(isValidCredData(invalidData), false);
});

Deno.test('isValidCredData should return false for missing expires_at', () => {
  const invalidData = {
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'refresh123',
    access_token: 'access123',
    athlete: { id: '123' },
  };
  assertEquals(isValidCredData(invalidData), false);
});

Deno.test('isValidCredData should return false for non-dict data', () => {
  assertEquals(isValidCredData(null), false);
  assertEquals(isValidCredData('string'), false);
  assertEquals(isValidCredData(123), false);
});

Deno.test('StravaCreds should initialize with default token if file does not exist', async () => {
  const mockFile = new MockFile('/tmp/test-creds.json', false);
  const creds = new StravaCreds(mockFile);
  await creds.read();
  assertEquals(creds.accessToken, undefined);
  assertEquals(creds.refreshToken, undefined);
  assertEquals(creds.expiresAt, 0);
});

Deno.test('StravaCreds should read valid credentials from file', async () => {
  const validData: StravaCredsData = {
    token_type: 'Bearer',
    expires_at: mockDate + 3600,
    expires_in: 3600,
    refresh_token: 'refresh_valid',
    access_token: 'access_valid',
    athlete: { id: 456 },
  };
  const mockFile = new MockFile('/tmp/test-creds.json', true, validData);
  const creds = new StravaCreds(mockFile);
  await creds.read();
  assertEquals(creds.accessToken, 'access_valid');
  assertEquals(creds.refreshToken, 'refresh_valid');
  assertEquals(creds.expiresAt, validData.expires_at);
});

Deno.test('StravaCreds should throw error for invalid credentials file', async () => {
  const invalidData = { some: 'invalid', data: 123 };
  const mockFile = new MockFile('/tmp/test-creds.json', true, invalidData);
  const creds = new StravaCreds(mockFile);
  await assertRejects(
    () => creds.read(),
    Error,
    'Invalid credentials file',
  );
});

Deno.test('StravaCreds should write valid credentials to file', async () => {
  const mockFile = new MockFile('/tmp/test-creds.json', false);
  const creds = new StravaCreds(mockFile);
  const newData: StravaCredsData = {
    token_type: 'Bearer',
    expires_at: mockDate + 7200,
    expires_in: 7200,
    refresh_token: 'new_refresh',
    access_token: 'new_access',
    athlete: { id: 789 },
  };
  await creds.write(newData);
  assertEquals(creds.accessToken, 'new_access');
  assertEquals(creds.refreshToken, 'new_refresh');
  assertEquals(creds.expiresAt, newData.expires_at);
  assertEquals(await mockFile.readJson(), newData);
});

Deno.test('StravaCreds should throw error for writing invalid credentials', async () => {
  const mockFile = new MockFile('/tmp/test-creds.json', false);
  const creds = new StravaCreds(mockFile);
  const invalidData = { bad: 'data' };
  await assertRejects(
    () => creds.write(invalidData as unknown as StravaCredsData),
    Error,
    'Invalid token data',
  );
});

Deno.test('StravaCreds isValid and needsRefresh should be valid if expires_at is in the future', async () => {
  const now = mockDate;
  const validData: StravaCredsData = {
    token_type: 'Bearer',
    expires_at: now + 8000,
    expires_in: 8000,
    refresh_token: 'r',
    access_token: 'a',
    athlete: {},
  };
  const mockFile = new MockFile('/tmp/test-creds.json', true, validData);
  const creds = new StravaCreds(mockFile);
  await creds.read();
  assertEquals(creds.isValid(0, now), true);
  assertEquals(creds.needsRefresh(undefined, now), false);
});

Deno.test('StravaCreds isValid and needsRefresh should be invalid if expires_at is in the past', async () => {
  const now = mockDate;
  const expiredData: StravaCredsData = {
    token_type: 'Bearer',
    expires_at: now - 1000,
    expires_in: -1000,
    refresh_token: 'r',
    access_token: 'a',
    athlete: {},
  };
  const mockFile = new MockFile('/tmp/test-creds.json', true, expiredData);
  const creds = new StravaCreds(mockFile);
  await creds.read();
  assertEquals(creds.isValid(0, now), false);
  assertEquals(creds.needsRefresh(undefined, now), true);
});

Deno.test('StravaCreds isValid and needsRefresh should be invalid if expires_at is in the future but within refresh window', async () => {
  const now = mockDate;
  const soonToExpireData: StravaCredsData = {
    token_type: 'Bearer',
    expires_at: now + 300,
    expires_in: 300,
    refresh_token: 'r',
    access_token: 'a',
    athlete: {},
  };
  const mockFile = new MockFile('/tmp/test-creds.json', true, soonToExpireData);
  const creds = new StravaCreds(mockFile);
  await creds.read();
  assertEquals(creds.isValid(0, now), true);
  assertEquals(creds.needsRefresh(undefined, now), true);
  assertEquals(creds.isValid(100, now), true);
  assertEquals(creds.needsRefresh(100, now), false);
});

Deno.test('StravaCreds isValid and needsRefresh should throw error if token_type is not Bearer', async () => {
  const now = mockDate;
  const wrongTypeData: StravaCredsData = {
    token_type: 'Mac',
    expires_at: now + 1000,
    expires_in: 1000,
    refresh_token: 'r',
    access_token: 'a',
    athlete: {},
  };
  const mockFile = new MockFile('/tmp/test-creds.json', true, wrongTypeData);
  const creds = new StravaCreds(mockFile);
  await assertRejects(
    () => creds.read(),
    Error,
    'Invalid credentials file',
  );
});
