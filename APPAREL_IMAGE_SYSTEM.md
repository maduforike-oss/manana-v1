# Apparel Image Auto-Mapping System

This document describes the comprehensive auto-mapping system for apparel images that automatically handles bundled uploads and dynamic image resolution.

## 🎯 System Overview

The system provides:
- **Dynamic Image Loading**: Automatically resolves images from multiple sources
- **Bundled Upload Support**: Handles zip files with consistent naming conventions
- **Auto-Mapping**: Maps uploaded images to garments using filename patterns
- **Fallback System**: Gracefully handles missing images with static fallbacks
- **Live Updates**: Immediately reflects uploaded images in UI components

## 📁 File Structure

```
src/
├── lib/studio/
│   ├── imageMapping.ts          # Core image resolution system
│   └── garments.ts              # Updated to use dynamic images
├── components/studio/
│   ├── ImageUploadDialog.tsx    # Upload interface with validation
│   ├── CanvasImageLoader.tsx    # Smart image component
│   ├── GarmentImageManager.tsx  # Management interface
│   ├── GarmentSelector.tsx      # Updated with upload button
│   └── Enhanced2DMockup.tsx     # Updated to use dynamic loader
└── assets/
    └── custom/                  # User uploaded images folder
        ├── README.md            # Usage documentation
        ├── .gitkeep            # Git tracking
        └── garment-config.json  # Metadata configuration
```

## 🔧 Core Components

### 1. Image Mapping System (`imageMapping.ts`)

**Key Functions:**
- `getGarmentImage(garmentId, orientation)` - Resolves single image
- `getAllGarmentImages(garmentId)` - Gets all orientations
- `mergeImagesWithGarment(garment)` - Applies dynamic images to garment type
- `validateImageFileName(filename)` - Validates upload naming

**Resolution Priority:**
1. Custom uploaded images (highest)
2. Static garment assets
3. Mockup images for canvas
4. Fallback placeholder

### 2. Upload Dialog (`ImageUploadDialog.tsx`)

**Features:**
- Drag & drop interface
- Real-time filename validation
- Progress tracking simulation
- Batch upload support
- Error handling and feedback

### 3. Canvas Image Loader (`CanvasImageLoader.tsx`)

**Smart Loading:**
- Automatic image resolution
- Fallback handling
- Performance optimized
- React hooks for easy integration

### 4. Garment Image Manager (`GarmentImageManager.tsx`)

**Management Features:**
- Visual overview of all images
- Source tracking (static/custom/mockup)
- Upload interface integration
- Statistics dashboard

## 📝 Naming Convention

All uploaded images must follow this pattern:

```
{garment-id}-{orientation}.{ext}
```

**Examples:**
- `tshirt-front.png`
- `hoodie-back.jpg`
- `tank-side.jpeg`
- `zip-hoodie-front.png`

**Supported Orientations:**
- `front` - Main product view
- `back` - Back view
- `side` - Side profile view

**Supported Formats:**
- PNG (recommended for transparency)
- JPG/JPEG (for photographs)

## 🎨 Garment ID Mapping

The system automatically normalizes common variations:

| Input | Normalized To |
|-------|---------------|
| `tshirt`, `tee` | `t-shirt` |
| `tank`, `tanktop` | `tank` |
| `zip-hoodie`, `ziphoodie` | `zip-hoodie` |
| `vneck`, `v-neck` | `vneck` |
| `longsleeve` | `long-sleeve-tee` |
| `bomber` | `bomber-jacket` |

## 🚀 Usage Examples

### 1. Basic Image Loading

```tsx
import { CanvasImageLoader } from '@/components/studio/CanvasImageLoader';

<CanvasImageLoader
  garmentId="t-shirt"
  orientation="front"
  className="w-full h-full object-contain"
  fallbackSrc="/default-tshirt.png"
/>
```

### 2. Get All Images for a Garment

```tsx
import { useGarmentImages } from '@/components/studio/CanvasImageLoader';

const MyComponent = () => {
  const images = useGarmentImages('hoodie');
  // images = { front: "url", back: "url", side: undefined }
};
```

### 3. Upload Integration

```tsx
import { ImageUploadDialog } from '@/components/studio/ImageUploadDialog';

<ImageUploadDialog
  onUploadComplete={(files) => {
    console.log('Uploaded:', files);
    // Trigger re-render or refresh logic
  }}
  trigger={<Button>Upload Images</Button>}
/>
```

## 🔄 Integration Points

### Garment Selector Hub
- Upload button in header
- Real-time preview updates
- Validation feedback

### Studio Canvas
- Dynamic mockup loading
- Color variation support
- Orientation switching

### Export System
- High-resolution image access
- Multiple format support
- Print-ready templates

## 📊 Image Guidelines

### Recommended Specifications:
- **Resolution**: 1024x1024px minimum
- **Background**: White or transparent
- **Format**: PNG for logos, JPG for photos
- **Compression**: High quality, minimal compression
- **Orientation**: Front-facing, centered
- **File Size**: Under 10MB per image

### Quality Standards:
- ✅ White/neutral background
- ✅ Consistent lighting
- ✅ Centered positioning
- ✅ High resolution
- ✅ Minimal shadows
- ❌ Wrinkled or distorted
- ❌ Poor lighting
- ❌ Off-center positioning

## 🔐 Advanced Features

### Auto-Detection
- New files dropped in `src/assets/custom/` are automatically detected
- Vite's glob imports handle the discovery
- Build process includes all matching files

### Metadata Configuration
- `garment-config.json` stores garment definitions
- Aliases for common naming variations
- Category and display name mappings
- Supported orientations per garment

### Future Enhancements
- **Zip Upload**: Direct zip file processing
- **Batch Validation**: Validate entire collections
- **Color Extraction**: Auto-detect garment colors
- **AI Enhancement**: Auto-crop and optimize uploads
- **Version Control**: Track image changes over time

## 🐛 Troubleshooting

### Common Issues:

1. **Images not appearing**
   - Check filename follows convention
   - Verify file is in `src/assets/custom/`
   - Ensure file format is supported

2. **Upload validation fails**
   - Check garment ID is recognized
   - Verify orientation is valid (front/back/side)
   - Ensure filename uses hyphens as separators

3. **Performance issues**
   - Large files should be under 10MB
   - Consider using JPG for photographic content
   - PNG recommended for graphics with transparency

### Debug Tools:
- Browser console shows image resolution paths
- `GarmentImageManager` component provides overview
- Upload dialog shows validation errors

## 🎉 Benefits

1. **Seamless Updates**: No code changes needed for new images
2. **Flexible Naming**: Supports common garment name variations
3. **Fallback System**: Graceful handling of missing images
4. **Performance**: Optimized loading with Vite's asset processing
5. **User-Friendly**: Intuitive upload interface with validation
6. **Scalable**: Supports unlimited garment types and orientations

This system transforms static image management into a dynamic, user-controlled asset pipeline that automatically maps uploaded images to the correct garments throughout the application.