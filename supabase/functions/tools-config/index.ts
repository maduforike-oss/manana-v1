import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tool definitions with current hardcoded structure
const TOOL_CATEGORIES = {
  selection: {
    name: "Selection Tools",
    order: 0,
    tools: [
      {
        id: "select",
        name: "Select",
        icon: "MousePointer2",
        shortcut: "V",
        description: "Select and move objects",
        capabilities: ["transform", "multiselect"]
      },
      {
        id: "hand",
        name: "Hand",
        icon: "Hand",
        shortcut: "H", 
        description: "Pan the canvas",
        capabilities: ["pan"]
      }
    ]
  },
  text: {
    name: "Text Tools",
    order: 1,
    tools: [
      {
        id: "text",
        name: "Text",
        icon: "Type",
        shortcut: "T",
        description: "Add text elements",
        capabilities: ["typography", "formatting"]
      }
    ]
  },
  drawing: {
    name: "Drawing Tools", 
    order: 2,
    tools: [
      {
        id: "brush",
        name: "Brush",
        icon: "PenTool",
        shortcut: "P",
        description: "Freehand drawing",
        capabilities: ["pressure", "opacity", "blending"],
        hasPresets: true
      },
      {
        id: "eraser",
        name: "Eraser",
        icon: "Eraser",
        shortcut: "E",
        description: "Erase elements",
        capabilities: ["pressure", "opacity"]
      }
    ]
  },
  shapes: {
    name: "Shape Tools",
    order: 3,
    tools: [
      {
        id: "rect",
        name: "Rectangle",
        icon: "Square",
        shortcut: "R",
        description: "Draw rectangles",
        capabilities: ["fill", "stroke", "transform"]
      },
      {
        id: "circle",
        name: "Circle", 
        icon: "Circle",
        shortcut: "C",
        description: "Draw circles",
        capabilities: ["fill", "stroke", "transform"]
      },
      {
        id: "line",
        name: "Line",
        icon: "Minus",
        shortcut: "L",
        description: "Draw lines",
        capabilities: ["stroke", "transform"]
      },
      {
        id: "triangle",
        name: "Triangle",
        icon: "Triangle", 
        shortcut: "",
        description: "Draw triangles",
        capabilities: ["fill", "stroke", "transform"]
      },
      {
        id: "star",
        name: "Star",
        icon: "Star",
        shortcut: "S",
        description: "Draw stars", 
        capabilities: ["fill", "stroke", "transform"]
      }
    ]
  },
  media: {
    name: "Media Tools",
    order: 4,
    tools: [
      {
        id: "image",
        name: "Image",
        icon: "Image",
        shortcut: "I",
        description: "Add images",
        capabilities: ["upload", "crop", "filters"]
      }
    ]
  }
};

// Brush presets matching current implementation
const BRUSH_PRESETS = {
  pencil: {
    id: "pencil",
    name: "Pencil",
    type: "pencil",
    settings: {
      size: 3,
      opacity: 0.8,
      flow: 1,
      hardness: 0.9,
      spacing: 0.05,
      pressureSizeMultiplier: 0.5,
      pressureOpacityMultiplier: 0.3,
      smoothing: 0.3,
      blendMode: "normal",
      color: "#000000"
    }
  },
  marker: {
    id: "marker",
    name: "Marker",
    type: "marker",
    settings: {
      size: 15,
      opacity: 0.6,
      flow: 0.8,
      hardness: 0.2,
      spacing: 0.1,
      pressureSizeMultiplier: 0.8,
      pressureOpacityMultiplier: 0.5,
      smoothing: 0.5,
      blendMode: "multiply",
      color: "#000000"
    }
  },
  spray: {
    id: "spray", 
    name: "Spray",
    type: "spray",
    settings: {
      size: 25,
      opacity: 0.1,
      flow: 0.3,
      hardness: 0,
      spacing: 0.2,
      pressureSizeMultiplier: 1.0,
      pressureOpacityMultiplier: 0.8,
      smoothing: 0.1,
      blendMode: "normal",
      color: "#000000"
    }
  },
  eraser: {
    id: "eraser",
    name: "Eraser",
    type: "eraser", 
    settings: {
      size: 20,
      opacity: 1,
      flow: 1,
      hardness: 0.8,
      spacing: 0.05,
      pressureSizeMultiplier: 0.3,
      pressureOpacityMultiplier: 0,
      smoothing: 0.2,
      blendMode: "normal",
      color: "transparent"
    }
  }
};

const BLEND_MODES = [
  "normal", "multiply", "screen", "overlay", "soft-light", "hard-light",
  "color-dodge", "color-burn", "darken", "lighten", "difference", 
  "exclusion", "hue", "saturation", "color", "luminosity"
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    // Handle different endpoints
    if (pathSegments.includes('brush') && pathSegments.includes('presets')) {
      // GET /api/design/tools/brush/presets
      return new Response(JSON.stringify({
        presets: Object.values(BRUSH_PRESETS),
        blendModes: BLEND_MODES,
        meta: {
          total: Object.keys(BRUSH_PRESETS).length,
          types: ["pencil", "marker", "spray", "eraser"]
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // GET /api/design/tools - Main tools endpoint
      const toolsList = Object.values(TOOL_CATEGORIES)
        .sort((a, b) => a.order - b.order)
        .flatMap(category => category.tools);

      return new Response(JSON.stringify({
        categories: TOOL_CATEGORIES,
        tools: toolsList,
        meta: {
          totalTools: toolsList.length,
          totalCategories: Object.keys(TOOL_CATEGORIES).length,
          version: "1.0.0"
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in tools-config function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});