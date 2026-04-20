/**
 * Tests for Constants and Core types
 */

import { describe, it } from '@std/testing/bdd';
import { expect } from '@std/expect';
import * as Consts from '../src/consts.ts';

describe('Constants', () => {
  describe('ActivityName', () => {
    it('should have all expected activity types', () => {
      expect(Consts.ActivityName.Ride).toBe('Ride');
      expect(Consts.ActivityName.Run).toBe('Run');
      expect(Consts.ActivityName.Swim).toBe('Swim');
      expect(Consts.ActivityName.Hike).toBe('Hike');
    });
  });

  describe('Type Guards', () => {
    describe('isStravaId', () => {
      it('should validate integer ids', () => {
        expect(Consts.isStravaId(12345)).toBe(true);
        expect(Consts.isStravaId(0)).toBe(true);
      });

      it('should reject non-integers', () => {
        expect(Consts.isStravaId(123.45)).toBe(false);
        expect(Consts.isStravaId('123')).toBe(false);
        expect(Consts.isStravaId(null)).toBe(false);
      });
    });

    describe('isActivityType', () => {
      it('should accept any string', () => {
        expect(Consts.isActivityType('Ride')).toBe(true);
        expect(Consts.isActivityType('CustomType')).toBe(true);
      });

      it('should reject non-strings', () => {
        expect(Consts.isActivityType(123)).toBe(false);
        expect(Consts.isActivityType(null)).toBe(false);
      });
    });

    describe('isKnownActivityType', () => {
      it('should validate known types', () => {
        expect(Consts.isKnownActivityType('Ride')).toBe(true);
        expect(Consts.isKnownActivityType('Run')).toBe(true);
      });

      it('should reject unknown types', () => {
        expect(Consts.isKnownActivityType('CustomType')).toBe(false);
      });
    });

    describe('isSex', () => {
      it('should validate F and M', () => {
        expect(Consts.isSex('F')).toBe(true);
        expect(Consts.isSex('M')).toBe(true);
      });

      it('should reject other values', () => {
        expect(Consts.isSex('X')).toBe(false);
        expect(Consts.isSex('')).toBe(false);
      });
    });

    describe('isResourceState', () => {
      it('should validate 1, 2, 3', () => {
        expect(Consts.isResourceState(1)).toBe(true);
        expect(Consts.isResourceState(2)).toBe(true);
        expect(Consts.isResourceState(3)).toBe(true);
      });

      it('should reject other values', () => {
        expect(Consts.isResourceState(0)).toBe(false);
        expect(Consts.isResourceState(4)).toBe(false);
      });
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
