# Custom Apparel Assets

This folder contains user-uploaded apparel assets that are processed by Vite during build.

## Naming Convention

All files should follow the pattern: `<garmentId>-<orientation>.<ext>`

Where:
- `garmentId`: The type of garment (e.g., tshirt, hoodie, crop-top)
- `orientation`: The view angle (front, back, or side)
- `ext`: File extension (png, jpg, etc.)

## Examples

```
tshirt-front.png
tshirt-back.png
hoodie-front.png
hoodie-back.png
crop-top-front.png
crop-top-back.png
tank-top-front.png
tank-top-back.png
```

## Usage

These assets are automatically processed by Vite and can be imported as ES6 modules:

```typescript
import tshirtFront from '@/assets/custom/tshirt-front.png';
import hoodieFront from '@/assets/custom/hoodie-front.png';
```

## Bundle Management

Compress all custom assets into a single zip file and extract them here. Vite will automatically pick them up during the build process.