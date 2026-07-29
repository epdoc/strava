import { assertEquals } from '@std/assert';
import * as Consts from '../src/consts.ts';

Deno.test('Constants ActivityName should have all expected activity types', () => {
  assertEquals(Consts.ActivityName.Ride, 'Ride');
  assertEquals(Consts.ActivityName.Run, 'Run');
  assertEquals(Consts.ActivityName.Swim, 'Swim');
  assertEquals(Consts.ActivityName.Hike, 'Hike');
});

Deno.test('Constants Type Guards isStravaId should validate integer ids', () => {
  assertEquals(Consts.isStravaId(12345), true);
  assertEquals(Consts.isStravaId(0), true);
});

Deno.test('Constants Type Guards isStravaId should reject non-integers', () => {
  assertEquals(Consts.isStravaId(123.45), false);
  assertEquals(Consts.isStravaId('123'), false);
  assertEquals(Consts.isStravaId(null), false);
});

Deno.test('Constants Type Guards isActivityType should accept any string', () => {
  assertEquals(Consts.isActivityType('Ride'), true);
  assertEquals(Consts.isActivityType('CustomType'), true);
});

Deno.test('Constants Type Guards isActivityType should reject non-strings', () => {
  assertEquals(Consts.isActivityType(123), false);
  assertEquals(Consts.isActivityType(null), false);
});

Deno.test('Constants Type Guards isKnownActivityType should validate known types', () => {
  assertEquals(Consts.isKnownActivityType('Ride'), true);
  assertEquals(Consts.isKnownActivityType('Run'), true);
});

Deno.test('Constants Type Guards isKnownActivityType should reject unknown types', () => {
  assertEquals(Consts.isKnownActivityType('CustomType'), false);
});

Deno.test('Constants Type Guards isSex should validate F and M', () => {
  assertEquals(Consts.isSex('F'), true);
  assertEquals(Consts.isSex('M'), true);
});

Deno.test('Constants Type Guards isSex should reject other values', () => {
  assertEquals(Consts.isSex('X'), false);
  assertEquals(Consts.isSex(''), false);
});

Deno.test('Constants Type Guards isResourceState should validate 1, 2, 3', () => {
  assertEquals(Consts.isResourceState(1), true);
  assertEquals(Consts.isResourceState(2), true);
  assertEquals(Consts.isResourceState(3), true);
});

Deno.test('Constants Type Guards isResourceState should reject other values', () => {
  assertEquals(Consts.isResourceState(0), false);
  assertEquals(Consts.isResourceState(4), false);
});

Deno.test('Constants StreamKeys should have all expected stream types', () => {
  assertEquals(Consts.StreamKeys.Time, 'time');
  assertEquals(Consts.StreamKeys.Distance, 'distance');
  assertEquals(Consts.StreamKeys.LatLng, 'latlng');
  assertEquals(Consts.StreamKeys.Altitude, 'altitude');
});
