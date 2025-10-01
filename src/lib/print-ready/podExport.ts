/**
 * POD-compliant export with metadata
 */

import { DesignDoc } from "@/lib/studio/types";
import { PhysicalDimensions } from "./physicalUnits";
import { PrintMethod } from "./printMethods";
import { GarmentSize } from "./garmentSizes";

export interface PODExportMetadata {
  garmentType: string;
  garmentSlug: string;
  garmentSize: GarmentSize;
  view: "front" | "back" | "left" | "right";
  printMethod: PrintMethod;
  printZone: {
    id: string;
    name: string;
    physical: PhysicalDimensions;
    position: { x: number; y: number };
  };
  colorProfile: "sRGB" | "CMYK" | "AdobeRGB";
  dpi: number;
  bleed: number;
  colorCount: number;
  timestamp: string;
  designId: string;
}

export interface PODExportFile {
  filename: string;
  blob: Blob;
  metadata: PODExportMetadata;
  metadataJSON: string;
}

/**
 * Generate POD-compliant filename
 */
export function generatePODFilename(
  metadata: PODExportMetadata,
  format: "png" | "pdf" | "svg" = "png"
): string {
  const parts = [
    metadata.garmentSlug,
    metadata.view,
    metadata.garmentSize,
    metadata.printMethod,
    metadata.printZone.id,
    `${metadata.dpi}dpi`,
    `${metadata.colorCount}c`,
  ];
  
  return `${parts.join("_")}.${format}`;
}

/**
 * Export design with POD metadata
 */
export async function exportForPOD(
  doc: DesignDoc,
  metadata: Partial<PODExportMetadata>,
  canvas: HTMLCanvasElement
): Promise<PODExportFile> {
  // Complete metadata
  const fullMetadata: PODExportMetadata = {
    garmentType: doc.canvas.garmentType || "t-shirt",
    garmentSlug: doc.canvas.garmentType || "t-shirt",
    garmentSize: "M" as GarmentSize,
    view: "front",
    printMethod: "DTG",
    printZone: {
      id: "front-center",
      name: "Front Center",
      physical: { width: 12, height: 16, unit: "in" },
      position: { x: 0, y: 0 },
    },
    colorProfile: "sRGB",
    dpi: doc.canvas.dpi,
    bleed: doc.canvas.bleedMm || 3,
    colorCount: 0,
    timestamp: new Date().toISOString(),
    designId: doc.id,
    ...metadata,
  };

  // Generate filename
  const filename = generatePODFilename(fullMetadata);

  // Convert canvas to blob
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b!), "image/png", 1.0);
  });

  // Create metadata JSON
  const metadataJSON = JSON.stringify(fullMetadata, null, 2);

  return {
    filename,
    blob,
    metadata: fullMetadata,
    metadataJSON,
  };
}

/**
 * Create export package with design + metadata
 */
export async function createPODPackage(
  exportFile: PODExportFile
): Promise<Blob> {
  // For now, just return the image blob
  // In a full implementation, this would create a ZIP with image + JSON
  return exportFile.blob;
}

/**
 * Download POD export file
 */
export function downloadPODExport(exportFile: PODExportFile): void {
  const url = URL.createObjectURL(exportFile.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = exportFile.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Also offer to download metadata
  const metaBlob = new Blob([exportFile.metadataJSON], { type: "application/json" });
  const metaUrl = URL.createObjectURL(metaBlob);
  const metaLink = document.createElement("a");
  metaLink.href = metaUrl;
  metaLink.download = exportFile.filename.replace(/\.\w+$/, "_metadata.json");
  document.body.appendChild(metaLink);
  metaLink.click();
  document.body.removeChild(metaLink);
  URL.revokeObjectURL(metaUrl);
}
