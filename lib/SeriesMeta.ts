import { TOUGH_PHONE_CASES } from './Toughphonecases.meta';
import { TOUGH_CASES        } from './Toughcases.meta';

export const SERIES_META = {
  'tough-phone-cases': {
    label:       'Classic series',
    desc:        'SPOKE · Print-template assets · Heavy border · Port notch',
    count:       TOUGH_PHONE_CASES.length,
    mockupFolder:'toughPhoneCases',
  },
  'toughcases': {
    label:       'Modern series',
    desc:        'WOYC · Mockup overlay assets · Slim border · Concentric camera ring',
    count:       TOUGH_CASES.length,
    mockupFolder:'toughCases',
  },
} as const;