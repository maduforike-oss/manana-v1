# Custom Garment Assets

This directory contains custom garment images that override the default static images.

## Current Custom Images Available:
- crewneck-front.png - Custom crewneck sweatshirt image
- polo-front.png - Custom polo shirt image  
- zip-hoodie-front.png - Custom zip-up hoodie image
- longsleeve-front.png - Custom long-sleeve t-shirt image

## Naming Convention:
Files should follow the pattern: `{garment-id}-{orientation}.{ext}`

Examples:
- `t-shirt-front.png`
- `hoodie-back.jpg`
- `cap-side.jpeg`

## Supported Orientations:
- `front` (most common)
- `back` 
- `side`

## How It Works:
The image mapping system (`src/lib/studio/imageMapping.ts`) automatically:
1. Scans this directory for images
2. Parses filenames to extract garment type and orientation  
3. Maps them to garment IDs using normalization rules
4. Makes them available in the GarmentSelector and canvas via CanvasImageLoader
5. Prioritizes custom images over static defaults

## Integration Points:
- **GarmentSelector**: Uses `mergeImagesWithGarments()` to show custom images
- **Canvas**: Uses `CanvasImageLoader` component with `getGarmentImage()` function
- **Studio**: Automatically renders custom images on mockups and previews

To add your images: Simply copy the 4 uploaded images to this directory with the correct names and they'll be automatically integrated into the system.