import { assertEquals } from '@std/assert';
import * as App from '../src/mod.ts';

Deno.test('SegmentData constructor should create from SegmentBase with all properties', () => {
  const base = new App.Segment.Base({
    id: 789,
    name: 'Mountain Climb',
    distance: 2500,
    elapsed_time: 600,
    moving_time: 580,
  });

  const data = new App.Segment.Data(base);

  assertEquals(data.id, 789);
  assertEquals(data.name, 'Mountain Climb');
  assertEquals(data.distance, 2500);
  assertEquals(data.elapsedTime, 600);
  assertEquals(data.movingTime, 580);
});

Deno.test('SegmentData constructor should initialize extended properties with defaults', () => {
  const base = new App.Segment.Base({
    id: 999,
    name: 'Test',
  });

  const data = new App.Segment.Data(base);

  assertEquals(data.coordinates, []);
  assertEquals(data.country, '');
  assertEquals(data.state, '');
  assertEquals(data.efforts, []);
});

Deno.test('SegmentData constructor should allow setting extended properties', () => {
  const base = new App.Segment.Base({
    id: 111,
    name: 'Valley Sprint',
  });

  const data = new App.Segment.Data(base);
  data.country = 'USA';
  data.state = 'California';
  data.coordinates = [
    { lat: 37.7749, lng: -122.4194 },
    { lat: 37.7750, lng: -122.4195 },
  ];

  assertEquals(data.country, 'USA');
  assertEquals(data.state, 'California');
  assertEquals(data.coordinates.length, 2);
});
