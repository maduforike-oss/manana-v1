import { useMemo } from "react";
import { Layer, Line, Circle } from "react-konva";
import { Node } from "@/lib/studio/types";
import { digitizeDesign } from "@/lib/embroidery";

interface StitchPreviewOverlayProps {
  nodes: Node[];
  visible: boolean;
  opacity?: number;
}

export function StitchPreviewOverlay({ nodes, visible, opacity = 0.6 }: StitchPreviewOverlayProps) {
  const digitizedData = useMemo(() => {
    return digitizeDesign(nodes);
  }, [nodes]);

  if (!visible) return null;

  return (
    <Layer opacity={opacity}>
      {digitizedData.nodes.map((digitizedNode, index) => {
        const { coordinates, threadColor, stitchType } = digitizedNode;

        if (stitchType === "fill" && coordinates.length >= 3) {
          // Draw fill pattern (simplified hatching)
          const lines: JSX.Element[] = [];
          const bounds = getBounds(coordinates);
          const spacing = 3; // 3px spacing between fill lines

          for (let y = bounds.minY; y <= bounds.maxY; y += spacing) {
            lines.push(
              <Line
                key={`fill-h-${index}-${y}`}
                points={[bounds.minX, y, bounds.maxX, y]}
                stroke={threadColor}
                strokeWidth={1}
                opacity={0.5}
              />
            );
          }

          return <>{lines}</>;
        } else if (stitchType === "satin" && coordinates.length >= 2) {
          // Draw satin stitch (thick line)
          const points = coordinates.flat();
          return (
            <Line
              key={`satin-${index}`}
              points={points}
              stroke={threadColor}
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
              opacity={0.7}
            />
          );
        } else if (stitchType === "running" && coordinates.length >= 2) {
          // Draw running stitch (dashed line with stitch points)
          const points = coordinates.flat();
          return (
            <>
              <Line
                key={`running-line-${index}`}
                points={points}
                stroke={threadColor}
                strokeWidth={1.5}
                dash={[5, 3]}
                opacity={0.6}
              />
              {coordinates.map((coord, i) => (
                <Circle
                  key={`running-dot-${index}-${i}`}
                  x={coord[0]}
                  y={coord[1]}
                  radius={1.5}
                  fill={threadColor}
                  opacity={0.8}
                />
              ))}
            </>
          );
        }

        return null;
      })}
    </Layer>
  );
}

/**
 * Get bounding box of coordinates
 */
function getBounds(coordinates: number[][]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of coordinates) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return { minX, minY, maxX, maxY };
}
