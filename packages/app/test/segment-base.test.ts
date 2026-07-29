import { assertEquals } from '@std/assert';
import * as App from '../src/mod.ts';

Deno.test('SegmentBase constructor should create an instance with default values', () => {
  const segment = new App.Segment.Base();

  assertEquals(segment.id, 0);
  assertEquals(segment.name, '');
  assertEquals(segment.distance, 0);
  assertEquals(segment.elapsed_time, 0);
  assertEquals(segment.moving_time, 0);
});

Deno.test('SegmentBase constructor should create an instance with provided values', () => {
  const segment = new App.Segment.Base({
    id: 123,
    name: 'Test Segment',
    distance: 1500,
    elapsed_time: 300,
    moving_time: 280,
  });

  assertEquals(segment.id, 123);
  assertEquals(segment.name, 'Test Segment');
  assertEquals(segment.distance, 1500);
  assertEquals(segment.elapsed_time, 300);
  assertEquals(segment.moving_time, 280);
});

Deno.test('SegmentBase constructor should handle partial data assignment', () => {
  const segment = new App.Segment.Base({
    id: 456,
    name: 'Partial Segment',
  });

  assertEquals(segment.id, 456);
  assertEquals(segment.name, 'Partial Segment');
  assertEquals(segment.distance, 0);
  assertEquals(segment.elapsed_time, 0);
});
