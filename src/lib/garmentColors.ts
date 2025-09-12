/**
 * Default garment colors available for template uploads
 */
export const DEFAULT_COLORS = [
  'white',
  'black',
  'gray',
  'navy',
  'heather',
  'charcoal',
  'blue',
  'red',
  'green',
  'yellow',
  'pink',
  'purple',
  'orange',
  'brown',
  'cream',
  'olive'
] as const

export type GarmentColor = typeof DEFAULT_COLORS[number]