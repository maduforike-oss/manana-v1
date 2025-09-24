import Konva from "konva";

export function getSmartPointer(stage: Konva.Stage) {
  const pos = stage.getPointerPosition();
  if (!pos) return null;
  const inv = stage.getAbsoluteTransform().copy().invert();
  const p = inv.point(pos);
  return { x: p.x, y: p.y };
}

export function getSmartPointerFromEvent(
  stage: Konva.Stage,
  e: Konva.KonvaEventObject<PointerEvent | MouseEvent | TouchEvent>
) {
  const pos = stage.getPointerPosition();
  if (!pos) return null;
  const inv = stage.getAbsoluteTransform().copy().invert();
  const p = inv.point(pos);
  return { x: p.x, y: p.y, evt: e.evt as PointerEvent };
}

export function fitStageToContainer(stage: Konva.Stage) {
  const rect = stage.container().getBoundingClientRect();
  if (stage.width() !== rect.width || stage.height() !== rect.height) {
    stage.size({ width: rect.width, height: rect.height });
    stage.batchDraw();
  }
}