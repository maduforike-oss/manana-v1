import { Tool } from "./types";

export const isShapeTool = (t: Tool): boolean => 
  t === "rect" || t === "circle" || t === "triangle";