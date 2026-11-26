export const FACEBOOK_CONTACT_URL =
  'https://www.facebook.com/PLACEHOLDER-UPDATE-WITH-REAL-FB-LINK';
export const CONTACT_EMAIL = 'liepama01@gmail.com';
export const CONTACT_PHONE = '0960-580-9638';

export type VehicleColorKey = 'white' | 'green' | 'grey' | 'yellow';

export interface VehicleColorOption {
  key: VehicleColorKey;
  name: string;
  finish: string;
  hex: string;
  textOnSwatch: string;
  borderHex: string;
}

export const VEHICLE_COLOR_OPTIONS: VehicleColorOption[] = [
  {
    key: 'white',
    name: 'White',
    finish: 'Pearl White',
    hex: '#F6F8FA',
    textOnSwatch: '#0A1830',
    borderHex: '#CBD5E1',
  },
  {
    key: 'green',
    name: 'Green',
    finish: 'Emerald Green',
    hex: '#2E7D4F',
    textOnSwatch: '#FFFFFF',
    borderHex: '#1E5B38',
  },
  {
    key: 'grey',
    name: 'Grey',
    finish: 'Zenith Grey',
    hex: '#7A8189',
    textOnSwatch: '#FFFFFF',
    borderHex: '#525860',
  },
  {
    key: 'yellow',
    name: 'Yellow',
    finish: 'Summer Sun Yellow',
    hex: '#F2C200',
    textOnSwatch: '#0A1830',
    borderHex: '#C59B00',
  },
];

export const VEHICLE_IDS = [
  'vf3base',
  'vf3eco',
  'vf3plus',
  'vf5plus',
  'vf6eco',
  'vf6plus',
  'vf7eco',
  'vf9plus',
  'limogreen',
  'mpv7',
  'heriogreen',
] as const;

export type VehicleId = (typeof VEHICLE_IDS)[number];

export function isVehicleId(id: string): id is VehicleId {
  return (VEHICLE_IDS as readonly string[]).includes(id);
}

export const VEHICLE_DEFAULT_COLOR: Record<VehicleId, VehicleColorKey> = {
  vf3base: 'white',
  vf3eco: 'green',
  vf3plus: 'yellow',
  vf5plus: 'white',
  vf6eco: 'grey',
  vf6plus: 'yellow',
  vf7eco: 'white',
  vf9plus: 'grey',
  limogreen: 'green',
  mpv7: 'white',
  heriogreen: 'green',
};

const VF3_IMAGES: Record<VehicleColorKey, string> = {
  white: '/src/assets/images/vf3_white_1795697707651.jpg',
  green: '/src/assets/images/vf3_green_1795697708394.jpg',
  grey: '/src/assets/images/vf3_grey_1795697707755.jpg',
  yellow: '/src/assets/images/vf3_yellow_1795697709865.jpg',
};

const VF5_IMAGES: Record<VehicleColorKey, string> = {
  white: '/src/assets/images/vf5_white_edit_1795698900071.jpg',
  green: '/src/assets/images/vf5_plus_base_1795698584400.jpg',
  grey: '/src/assets/images/vf5_grey_edit_1795698900088.jpg',
  yellow: '/src/assets/images/vf5_yellow_edit_1795698900849.jpg',
};

const VF6_IMAGES: Record<VehicleColorKey, string> = {
  white: '/src/assets/images/vf6_white_edit_1795698902180.jpg',
  green: '/src/assets/images/vf6_base_1795698586544.jpg',
  grey: '/src/assets/images/vf6_grey_edit_1795698901271.jpg',
  yellow: '/src/assets/images/vf6_yellow_edit_1795698902406.jpg',
};

const VF7_IMAGES: Record<VehicleColorKey, string> = {
  white: '/src/assets/images/vf7_white_edit_1795698903488.jpg',
  green: '/src/assets/images/vf7_base_1795698585670.jpg',
  grey: '/src/assets/images/vf7_grey_edit_1795698904017.jpg',
  yellow: '/src/assets/images/vf7_yellow_edit_1795698903664.jpg',
};

const VF9_IMAGES: Record<VehicleColorKey, string> = {
  white: '/src/assets/images/vf9_white_edit_1795698883056.jpg',
  green: '/src/assets/images/vf9_base_1795698586629.jpg',
  grey: '/src/assets/images/vf9_grey_edit_1795698881850.jpg',
  yellow: '/src/assets/images/vf9_yellow_edit_1795698883007.jpg',
};

const LIMO_GREEN_IMAGES: Record<VehicleColorKey, string> = {
  white: '/src/assets/images/limogreen_white_edit_1795698920620.jpg',
  green: '/src/assets/images/limogreen_base_1795698587240.jpg',
  grey: '/src/assets/images/limogreen_grey_edit_1795698922191.jpg',
  yellow: '/src/assets/images/limogreen_yellow_edit_1795698967292.jpg',
};

const MPV7_IMAGES: Record<VehicleColorKey, string> = {
  white: '/src/assets/images/mpv7_white_edit_1795698967323.jpg',
  green: '/src/assets/images/mpv7_base_1795698588926.jpg',
  grey: '/src/assets/images/mpv7_grey_edit_1795698924073.jpg',
  yellow: '/src/assets/images/mpv7_yellow_edit_1795698966647.jpg',
};

const HERIO_GREEN_IMAGES: Record<VehicleColorKey, string> = {
  white: '/src/assets/images/heriogreen_white_edit_1795698967136.jpg',
  green: '/src/assets/images/heriogreen_base_1795698589678.jpg',
  grey: '/src/assets/images/heriogreen_grey_edit_1795698967317.jpg',
  yellow: '/src/assets/images/heriogreen_yellow_edit_1795698967067.jpg',
};

export const VEHICLE_COLOR_IMAGES: Record<
  VehicleId,
  Record<VehicleColorKey, string>
> = {
  vf3base: VF3_IMAGES,
  vf3eco: VF3_IMAGES,
  vf3plus: VF3_IMAGES,
  vf5plus: VF5_IMAGES,
  vf6eco: VF6_IMAGES,
  vf6plus: VF6_IMAGES,
  vf7eco: VF7_IMAGES,
  vf9plus: VF9_IMAGES,
  limogreen: LIMO_GREEN_IMAGES,
  mpv7: MPV7_IMAGES,
  heriogreen: HERIO_GREEN_IMAGES,
};

export const ALL_UNIQUE_VEHICLE_IMAGE_URLS: string[] = Array.from(
  new Set(
    Object.values(VEHICLE_COLOR_IMAGES).flatMap((colorMap) =>
      Object.values(colorMap)
    )
  )
);

export interface Vehicle {
  id: VehicleId;
  name: string;
  srp: number;
  dp: number;
  monthly: number;
  color: string;
  supportsColorSelector: boolean;
}

export const VEHICLES: Vehicle[] = [
  {
    id: 'vf3base',
    name: 'VF3 Base',
    srp: 590000,
    dp: 54600,
    monthly: 13212,
    color: '#f2c200',
    supportsColorSelector: true,
  },
  {
    id: 'vf3eco',
    name: 'VF3 Eco',
    srp: 599000,
    dp: 54600,
    monthly: 13413,
    color: '#8fae4a',
    supportsColorSelector: true,
  },
  {
    id: 'vf3plus',
    name: 'VF3 Plus',
    srp: 629000,
    dp: 57600,
    monthly: 14086,
    color: '#3aa3d8',
    supportsColorSelector: true,
  },
  {
    id: 'vf5plus',
    name: 'VF5 Plus',
    srp: 949000,
    dp: 70100,
    monthly: 21251,
    color: '#2a7f8f',
    supportsColorSelector: true,
  },
  {
    id: 'vf6eco',
    name: 'VF6 Eco',
    srp: 1249000,
    dp: 86100,
    monthly: 27967,
    color: '#9aa3ad',
    supportsColorSelector: true,
  },
  {
    id: 'vf6plus',
    name: 'VF6 Plus',
    srp: 1409000,
    dp: 93100,
    monthly: 31551,
    color: '#c23b3b',
    supportsColorSelector: true,
  },
  {
    id: 'vf7eco',
    name: 'VF7 Eco',
    srp: 1430000,
    dp: 97000,
    monthly: 32021,
    color: '#2f6fb0',
    supportsColorSelector: true,
  },
  {
    id: 'vf9plus',
    name: 'VF9 Plus',
    srp: 3845000,
    dp: 226500,
    monthly: 86098,
    color: '#1d1d1d',
    supportsColorSelector: true,
  },
  {
    id: 'limogreen',
    name: 'Limo Green',
    srp: 1139000,
    dp: 82100,
    monthly: 25505,
    color: '#e7e7e7',
    supportsColorSelector: true,
  },
  {
    id: 'mpv7',
    name: 'MPV7',
    srp: 1239000,
    dp: 93900,
    monthly: 27570,
    color: '#2b2b2b',
    supportsColorSelector: true,
  },
  {
    id: 'heriogreen',
    name: 'Herio Green',
    srp: 895000,
    dp: 69500,
    monthly: 20041,
    color: '#4c8a3f',
    supportsColorSelector: true,
  },
];

export const VEHICLE_IMAGES: Record<VehicleId, string> = {
  vf3base: VEHICLE_COLOR_IMAGES.vf3base[VEHICLE_DEFAULT_COLOR.vf3base],
  vf3eco: VEHICLE_COLOR_IMAGES.vf3eco[VEHICLE_DEFAULT_COLOR.vf3eco],
  vf3plus: VEHICLE_COLOR_IMAGES.vf3plus[VEHICLE_DEFAULT_COLOR.vf3plus],
  vf5plus: VEHICLE_COLOR_IMAGES.vf5plus[VEHICLE_DEFAULT_COLOR.vf5plus],
  vf6eco: VEHICLE_COLOR_IMAGES.vf6eco[VEHICLE_DEFAULT_COLOR.vf6eco],
  vf6plus: VEHICLE_COLOR_IMAGES.vf6plus[VEHICLE_DEFAULT_COLOR.vf6plus],
  vf7eco: VEHICLE_COLOR_IMAGES.vf7eco[VEHICLE_DEFAULT_COLOR.vf7eco],
  vf9plus: VEHICLE_COLOR_IMAGES.vf9plus[VEHICLE_DEFAULT_COLOR.vf9plus],
  limogreen: VEHICLE_COLOR_IMAGES.limogreen[VEHICLE_DEFAULT_COLOR.limogreen],
  mpv7: VEHICLE_COLOR_IMAGES.mpv7[VEHICLE_DEFAULT_COLOR.mpv7],
  heriogreen: VEHICLE_COLOR_IMAGES.heriogreen[VEHICLE_DEFAULT_COLOR.heriogreen],
};

export function peso(n: number): string {
  return '₱' + n.toLocaleString('en-PH');
}
