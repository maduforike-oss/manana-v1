// Tools and brushes API client
import { supabase } from "@/integrations/supabase/client";

export interface ToolDefinition {
  id: string;
  name: string;
  icon: string;
  shortcut: string;
  description: string;
  capabilities: string[];
  hasPresets?: boolean;
}

export interface ToolCategory {
  name: string;
  order: number;
  tools: ToolDefinition[];
}

export interface BrushPreset {
  id: string;
  name: string;
  type: string;
  settings: {
    size: number;
    opacity: number;
    flow: number;
    hardness: number;
    spacing: number;
    pressureSizeMultiplier: number;
    pressureOpacityMultiplier: number;
    smoothing: number;
    blendMode: string;
    color: string;
  };
}

export interface ToolsResponse {
  categories: Record<string, ToolCategory>;
  tools: ToolDefinition[];
  meta: {
    totalTools: number;
    totalCategories: number;
    version: string;
  };
}

export interface BrushPresetsResponse {
  presets: BrushPreset[];
  blendModes: string[];
  meta: {
    total: number;
    types: string[];
  };
}

const API_BASE = `https://ajnbtevgzhkilokflntj.supabase.co/functions/v1`;

/**
 * Fetch all available design tools
 */
export async function getTools(): Promise<ToolsResponse> {
  const { data, error } = await supabase.functions.invoke('tools-config');
  
  if (error) {
    console.error('Failed to fetch tools:', error);
    throw new Error(`Failed to fetch tools: ${error.message}`);
  }
  
  return data;
}

/**
 * Fetch brush presets and configurations
 */
export async function getBrushPresets(): Promise<BrushPresetsResponse> {
  const { data, error } = await supabase.functions.invoke('tools-config/brush/presets');
  
  if (error) {
    console.error('Failed to fetch brush presets:', error);
    throw new Error(`Failed to fetch brush presets: ${error.message}`);
  }
  
  return data;
}

/**
 * Get tool by ID from cached tools list
 */
export function getToolById(tools: ToolDefinition[], toolId: string): ToolDefinition | undefined {
  return tools.find(tool => tool.id === toolId);
}

/**
 * Get tools by category
 */
export function getToolsByCategory(categories: Record<string, ToolCategory>, categoryId: string): ToolDefinition[] {
  return categories[categoryId]?.tools || [];
}

/**
 * Validate if a tool ID is valid
 */
export function isValidTool(tools: ToolDefinition[], toolId: string): boolean {
  return tools.some(tool => tool.id === toolId);
}