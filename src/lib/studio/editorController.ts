import Konva from 'konva';

export function addText(layer: Konva.Layer, text: string = "New Text") {
  const node = new Konva.Text({ 
    text, 
    x: layer.width() / 2 - 60, 
    y: layer.height() / 2 - 12, 
    fontSize: 24, 
    draggable: true,
    fill: '#000000'
  });
  layer.add(node);
  layer.draw();
  return node;
}

export function addRect(layer: Konva.Layer) {
  const node = new Konva.Rect({ 
    x: 120, 
    y: 120, 
    width: 160, 
    height: 100, 
    fill: "#f2f2f2", 
    stroke: "#111", 
    draggable: true 
  });
  layer.add(node);
  layer.draw();
  return node;
}

export function addCircle(layer: Konva.Layer) {
  const node = new Konva.Circle({
    x: 200,
    y: 200,
    radius: 50,
    fill: "#f2f2f2",
    stroke: "#111",
    draggable: true
  });
  layer.add(node);
  layer.draw();
  return node;
}