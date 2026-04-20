import { expect } from '@std/expect';
import { describe, it } from '@std/testing/bdd';
import * as Consts from '../src/consts.ts';

describe('Constants and Enums', () => {
  describe('ActivityName', () => {
    it('should have all expected activity types', () => {
      expect(Consts.ActivityName.Ride).toBe('Ride');
      expect(Consts.ActivityName.Run).toBe('Run');
      expect(Consts.ActivityName.Swim).toBe('Swim');
      expect(Consts.ActivityName.Hike).toBe('Hike');
    });

    it('should validate activity types with schema', () => {
      const result = Consts.ActivityNameSchema.safeParse('Ride');
      expect(result.success).toBe(true);
    });

    it('should reject invalid activity types', () => {
      const result = Consts.ActivityNameSchema.safeParse('InvalidActivity');
      expect(result.success).toBe(false);
    });
  });

  describe('ResourceState', () => {
    it('should have correct values', () => {
      expect(Consts.ResourceState.Meta).toBe(1);
      expect(Consts.ResourceState.Summary).toBe(2);
      expect(Consts.ResourceState.Detail).toBe(3);
    });

    it('should validate resource states with schema', () => {
      expect(Consts.ResourceStateSchema.safeParse(1).success).toBe(true);
      expect(Consts.ResourceStateSchema.safeParse(2).success).toBe(true);
      expect(Consts.ResourceStateSchema.safeParse(3).success).toBe(true);
    });

    it('should reject invalid resource states', () => {
      expect(Consts.ResourceStateSchema.safeParse(0).success).toBe(false);
      expect(Consts.ResourceStateSchema.safeParse(4).success).toBe(false);
    });
  });

  describe('Sex', () => {
    it('should have correct values', () => {
      expect(Consts.Sex.Female).toBe('F');
      expect(Consts.Sex.Male).toBe('M');
    });

    it('should validate sex values with schema', () => {
      expect(Consts.SexSchema.safeParse('F').success).toBe(true);
      expect(Consts.SexSchema.safeParse('M').success).toBe(true);
    });

    it('should reject invalid sex values', () => {
      expect(Consts.SexSchema.safeParse('X').success).toBe(false);
    });
  });

  describe('StreamKeys', () => {
    it('should have all expected stream types', () => {
      expect(Consts.StreamKeys.Time).toBe('time');
      expect(Consts.StreamKeys.Distance).toBe('distance');
      expect(Consts.StreamKeys.LatLng).toBe('latlng');
      expect(Consts.StreamKeys.Altitude).toBe('altitude');
    });
  });
});
