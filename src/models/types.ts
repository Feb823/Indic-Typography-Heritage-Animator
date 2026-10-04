export type PatternStyle = 'banarasi' | 'kanchipuram' | 'kalamkari' | 'ikat';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface MaterialParams {
  shininess: number;
  roughness: number;
  transparency: number;
}

export interface LightingParams {
  color: string;
  intensity: number;
  angle: number; // angle in degrees
}

export interface PhysicsParams {
  explanation: string;
  windSpeed: number;
  windDirection: number; // in degrees
  gravity: number;
  drapeStyle: 'sari' | 'kurta' | 'dupatta' | 'lungi';
  material: MaterialParams;
  lighting: LightingParams;
}

export interface GenerationResult {
  success: boolean;
  patternUrl: string;
  promptUsed: string;
  generationTimeMs: number;
  isMocked: boolean;
}

export interface PatternHistoryItem {
  id: string;
  style: PatternStyle;
  prompt: string;
  patternUrl: string;
  timestamp?: string;
}
