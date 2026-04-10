export const LOADING_VARIANTS = [
  'swirl',
  'falling',
  'pulse',
  'rising',
  'orbit',
  'scatter',
  'wave',
  'spiral',
  'bloom',
];

export function pickRandomLoadingVariant() {
  const index = Math.floor(Math.random() * LOADING_VARIANTS.length);
  return LOADING_VARIANTS[index];
}
