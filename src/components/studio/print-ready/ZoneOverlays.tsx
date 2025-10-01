import React from "react";
import { Layer, Rect, Text } from "react-konva";
import { PhysicalZone, getZoneStyle } from "@/lib/print-ready/zones";

interface ZoneOverlaysProps {
  zones: PhysicalZone[];
  showLabels?: boolean;
}

export function ZoneOverlays({ zones, showLabels = true }: ZoneOverlaysProps) {
  return (
    <Layer listening={false}>
      {zones
        .filter((zone) => zone.visible)
        .map((zone) => {
          const style = getZoneStyle(zone.type);
          
          return (
            <React.Fragment key={zone.id}>
              <Rect
                x={zone.position.x}
                y={zone.position.y}
                width={zone.pixels.width}
                height={zone.pixels.height}
                stroke={style.strokeColor}
                strokeWidth={style.strokeWidth}
                dash={style.strokeDashArray}
                fill={style.strokeColor}
                opacity={style.fillOpacity}
                listening={false}
              />
              
              {showLabels && (
                <Text
                  x={zone.position.x + 8}
                  y={zone.position.y + 8}
                  text={zone.name}
                  fontSize={12}
                  fill={style.strokeColor}
                  listening={false}
                  opacity={0.8}
                />
              )}
            </React.Fragment>
          );
        })}
    </Layer>
  );
}
