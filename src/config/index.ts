export const CONFIG = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  MODELS: {
    PATTERN_GEN: 'gemini-3.1-flash-lite-image',
    PHYSICS_CHAT: 'gemini-omni-flash-preview',
  },
  DEFAULT_PHYSICS: {
    explanation: 'Initial state loaded with default drape configurations.',
    windSpeed: 2.0,
    windDirection: 0,
    gravity: 9.8,
    drapeStyle: 'sari' as const,
    material: {
      shininess: 0.6,
      roughness: 0.3,
      transparency: 0.0,
    },
    lighting: {
      color: '#ffffff',
      intensity: 1.0,
      angle: 45,
    },
  },
};
export default CONFIG;
