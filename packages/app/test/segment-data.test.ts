import { expect } from '@std/expect';
import { describe, it } from '@std/testing/bdd';
import * as App from '../src/mod.ts';

describe('SegmentData', () => {
  describe('constructor', () => {
    it('should create from SegmentBase with all properties', () => {
      const base = new App.Segment.Base({
        id: 789,
        name: 'Mountain Climb',
        distance: 2500,
        elapsed_time: 600,
        moving_time: 580,
      });

      const data = new App.Segment.Data(base);

      expect(data.id).toBe(789);
      expect(data.name).toBe('Mountain Climb');
      expect(data.distance).toBe(2500);
      expect(data.elapsedTime).toBe(600);
      expect(data.movingTime).toBe(580);
    });

    it('should initialize extended properties with defaults', () => {
      const base = new App.Segment.Base({
        id: 999,
        name: 'Test',
      });

      const data = new App.Segment.Data(base);

      expect(data.coordinates).toEqual([]);
      expect(data.country).toBe('');
      expect(data.state).toBe('');
      expect(data.efforts).toEqual([]);
    });

    it('should allow setting extended properties', () => {
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

      expect(data.country).toBe('USA');
      expect(data.state).toBe('California');
      expect(data.coordinates).toHaveLength(2);
    });
  });
});
