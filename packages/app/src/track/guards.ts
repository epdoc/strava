import * as Schema from '@epdoc/strava-schema';
import { _ } from '@epdoc/type';
import type { ActivityExType, KmlLineStyle } from './types.ts';

export function isValidActivityType(name: string): name is ActivityExType {
  // Allow standard activity types, plus custom style names (Default, Commute, Moto, Segment, etc.)
  return (Schema.Consts.ActivityName && name in Schema.Consts.ActivityName) ||
    name === 'Default' ||
    name === 'Commute' ||
    name === 'Moto' ||
    name === 'Segment';
}

export function isValidLineStyle(val: KmlLineStyle): val is KmlLineStyle {
  return !!(val && _.isString(val.color) && _.isNumber(val.width) && _.isHexString(val.color, 8));
}
