
export const LOTA_BLACK =  {
  family: 'LotaGrotesqueAlt3-Black, "HelveticaNeue", sans-serif',
  weight: 900,
  color: 'black'
};
export const LOTA_BOLD = {
  family: 'LotaGrotesqueAlt3-Bold, "HelveticaNeue", sans-serif',
  weight: 700,
  color: 'black'

};
export const LOTA_REGULAR = {
  family: 'LotaGrotesqueAlt3-Regular, "HelveticaNeue", sans-serif',
  weight: 400,
  color: 'black'
};

const GRAY = '#5d5d5d';

export const headerFonts = [
  LOTA_BLACK,
  LOTA_BOLD,
  {...LOTA_BOLD, color: GRAY},
  LOTA_REGULAR,
  {...LOTA_REGULAR, color: GRAY},
  {...LOTA_REGULAR, color: GRAY},
];
