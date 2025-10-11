export const LAYERS = {
  overlay: 900,
  modal: 1000,
  toast: 1200,
} as const;

export type LayerKey = keyof typeof LAYERS;
