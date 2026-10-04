import { GoogleGenAI } from '@google/genai';
import { CONFIG } from '@/config';
import { Message, PhysicsParams, PatternStyle } from '@/models/types';
import { PATTERN_GENERATION_SYSTEM_PROMPT, PHYSICS_REFINEMENT_SYSTEM_PROMPT } from '@/prompts/systemPrompts';
import { generateMockPattern } from './mockService';

// Initialize the Google GenAI SDK if API key is provided
const ai = CONFIG.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: CONFIG.GEMINI_API_KEY }) : null;

/**
 * Generate fabric texture pattern.
 * Chains to Nano Banana 2 Lite, falls back to high-fidelity procedural SVGs if missing key or error occurs.
 */
export async function generateFabricPattern(style: PatternStyle, prompt: string): Promise<{
  patternUrl: string;
  promptUsed: string;
  isMocked: boolean;
}> {
  const startTime = performance.now();
  const enhancedPrompt = `Generate a luxurious ${style} silk textile featuring ${prompt}, seamless repeating pattern, premium Indian weaving style, top-down fabric texture, highly detailed, tileable, no folds, no mannequin, no background.`;

  if (!ai) {
    // API Key missing - run procedural fallback
    const patternUrl = await generateMockPattern(style, prompt);
    const endTime = performance.now();
    
    console.log('=== FABRIC SYNTHESIZER DIAGNOSTICS ===');
    console.log(`Selected Style:     ${style.toUpperCase()}`);
    console.log(`Custom Prompt:      "${prompt}"`);
    console.log(`Final LLM Prompt:   "${enhancedPrompt}"`);
    console.log(`Returned Image URL: ${patternUrl.substring(0, 80)}...`);
    console.log(`Generation Time:    ${Math.round(endTime - startTime)}ms`);
    console.log(`API Status:         Mock Fallback (Key Not Found)`);
    console.log('======================================');

    return {
      patternUrl,
      promptUsed: enhancedPrompt,
      isMocked: true,
    };
  }

  try {
    const response = await ai.models.generateImages({
      model: CONFIG.MODELS.PATTERN_GEN,
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '1:1',
        outputMimeType: 'image/png',
      },
    });

    const endTime = performance.now();

    if (response.generatedImages && response.generatedImages[0]) {
      const base64Data = response.generatedImages[0].image?.imageBytes || '';
      const patternUrl = base64Data.startsWith('data:') ? base64Data : `data:image/png;base64,${base64Data}`;

      console.log('=== FABRIC SYNTHESIZER DIAGNOSTICS ===');
      console.log(`Selected Style:     ${style.toUpperCase()}`);
      console.log(`Custom Prompt:      "${prompt}"`);
      console.log(`Final LLM Prompt:   "${enhancedPrompt}"`);
      console.log(`Returned Image URL: ${patternUrl.substring(0, 80)}...`);
      console.log(`Generation Time:    ${Math.round(endTime - startTime)}ms`);
      console.log(`API Status:         SUCCESS (Gemini NB2)`);
      console.log('======================================');

      return {
        patternUrl,
        promptUsed: enhancedPrompt,
        isMocked: false,
      };
    }
    throw new Error('No images returned from API');
  } catch (error: any) {
    const patternUrl = await generateMockPattern(style, prompt);
    const endTime = performance.now();

    console.log('=== FABRIC SYNTHESIZER DIAGNOSTICS ===');
    console.log(`Selected Style:     ${style.toUpperCase()}`);
    console.log(`Custom Prompt:      "${prompt}"`);
    console.log(`Final LLM Prompt:   "${enhancedPrompt}"`);
    console.log(`Returned Image URL: ${patternUrl.substring(0, 80)}...`);
    console.log(`Generation Time:    ${Math.round(endTime - startTime)}ms`);
    console.log(`API Status:         FAILED ("${error.message}") - Swapped to Mock SVG`);
    console.log('======================================');

    return {
      patternUrl,
      promptUsed: enhancedPrompt,
      isMocked: true,
    };
  }
}

/**
 * Process conversational multi-turn physics adjustment.
 * Enforces structured outputs via Gemini Omni Flash, with a local keyword parser fallback.
 */
export async function refineDrapePhysics(messages: Message[]): Promise<PhysicsParams> {
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || '';

  if (!ai) {
    return generateSimulatedPhysics(lastUserMessage, messages);
  }

  try {
    // Transform chat messages into GenAI SDK schema
    const contents = messages.map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: CONFIG.MODELS.PHYSICS_CHAT,
      contents,
      config: {
        systemInstruction: PHYSICS_REFINEMENT_SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            explanation: { type: 'STRING' },
            windSpeed: { type: 'NUMBER' },
            windDirection: { type: 'NUMBER' },
            gravity: { type: 'NUMBER' },
            drapeStyle: { type: 'STRING', enum: ['sari', 'kurta', 'dupatta', 'lungi'] },
            shininess: { type: 'NUMBER' },
            roughness: { type: 'NUMBER' },
            transparency: { type: 'NUMBER' },
            lightColor: { type: 'STRING' },
            lightIntensity: { type: 'NUMBER' },
            lightAngle: { type: 'NUMBER' },
          },
          required: [
            'explanation', 'windSpeed', 'windDirection', 'gravity', 'drapeStyle',
            'shininess', 'roughness', 'transparency', 'lightColor', 'lightIntensity', 'lightAngle'
          ],
        },
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        explanation: parsed.explanation,
        windSpeed: Number(parsed.windSpeed),
        windDirection: Number(parsed.windDirection),
        gravity: Number(parsed.gravity),
        drapeStyle: parsed.drapeStyle,
        material: {
          shininess: Number(parsed.shininess),
          roughness: Number(parsed.roughness),
          transparency: Number(parsed.transparency),
        },
        lighting: {
          color: parsed.lightColor,
          intensity: Number(parsed.lightIntensity),
          angle: Number(parsed.lightAngle ?? 45),
        },
      };
    }
    throw new Error('Empty response from model');
  } catch (error) {
    console.error('Gemini Physics API call failed, falling back to simulated parser:', error);
    return generateSimulatedPhysics(lastUserMessage, messages);
  }
}

/**
 * Intelligent keyword-matching fallback generator.
 * Emulates LLM physics adjustment in millisecond times.
 */
function generateSimulatedPhysics(userInput: string, history: Message[]): PhysicsParams {
  const input = userInput.toLowerCase();
  
  // Default values
  let explanation = 'I have adjusted the drape parameters based on your instructions.';
  let windSpeed = CONFIG.DEFAULT_PHYSICS.windSpeed;
  let windDirection = CONFIG.DEFAULT_PHYSICS.windDirection;
  let gravity = CONFIG.DEFAULT_PHYSICS.gravity;
  let drapeStyle: PhysicsParams['drapeStyle'] = CONFIG.DEFAULT_PHYSICS.drapeStyle;
  let shininess = CONFIG.DEFAULT_PHYSICS.material.shininess;
  let roughness = CONFIG.DEFAULT_PHYSICS.material.roughness;
  let transparency = CONFIG.DEFAULT_PHYSICS.material.transparency;
  let lightColor = CONFIG.DEFAULT_PHYSICS.lighting.color;
  let lightIntensity = CONFIG.DEFAULT_PHYSICS.lighting.intensity;
  let lightAngle = CONFIG.DEFAULT_PHYSICS.lighting.angle;

  // Simple heuristic mapping
  if (input.includes('wind') || input.includes('storm') || input.includes('blow') || input.includes('monsoon')) {
    windSpeed = 8.5;
    windDirection = -90; // Default left wind
    explanation = 'Increasing the wind simulation to monsoon storm force coming from the left.';
    if (input.includes('right')) {
      windDirection = 90;
      explanation = 'Increasing the wind simulation to monsoon storm force blowing from the right.';
    }
    if (input.includes('light') || input.includes('gentle')) {
      windSpeed = 3.0;
      explanation = 'Adding a gentle breeze to rustle the fabric.';
    }
  }

  if (input.includes('sari') || input.includes('saree')) {
    drapeStyle = 'sari';
    gravity = 10.5;
    explanation += ' Setting the mannequin drape configuration to a traditional heavy Kanchipuram/Banarasi sari outline.';
  } else if (input.includes('kurta')) {
    drapeStyle = 'kurta';
    gravity = 8.0;
    explanation += ' Setting the mannequin drape configuration to a relaxed, structured kurta cut.';
  } else if (input.includes('dupatta')) {
    drapeStyle = 'dupatta';
    gravity = 4.0; // Dupatta is light
    transparency = 0.5;
    shininess = 0.3;
    explanation += ' Setting the drape configuration to a lightweight, semi-transparent chiffon dupatta drape.';
  } else if (input.includes('lungi') || input.includes('sarong') || input.includes('dhoti')) {
    drapeStyle = 'lungi';
    gravity = 9.8;
    explanation += ' Setting the drape configuration to a traditional wrap-around Kerala-style Lungi.';
  }

  if (input.includes('sunset') || input.includes('warm') || input.includes('evening')) {
    lightColor = '#ff6b35';
    lightIntensity = 1.3;
    lightAngle = 180;
    explanation += ' Shifting the spotlights to a warm golden sunset glow.';
  } else if (input.includes('monsoon') || input.includes('rain') || input.includes('cool')) {
    lightColor = '#a2d2ff';
    lightIntensity = 0.7;
    lightAngle = 90;
    explanation += ' Shifting the spotlights to a cool overcast monsoon tint.';
  } else if (input.includes('gold') || input.includes('showroom') || input.includes('bright')) {
    lightColor = '#ffd700';
    lightIntensity = 1.5;
    lightAngle = 45;
    explanation += ' Enabling bright golden zari showroom lighting.';
  }

  if (input.includes('silk') || input.includes('zari') || input.includes('shiny')) {
    shininess = 0.9;
    roughness = 0.1;
  } else if (input.includes('cotton') || input.includes('matte') || input.includes('rough')) {
    shininess = 0.1;
    roughness = 0.85;
  }

  return {
    explanation: explanation.trim(),
    windSpeed,
    windDirection,
    gravity,
    drapeStyle,
    material: {
      shininess,
      roughness,
      transparency,
    },
    lighting: {
      color: lightColor,
      intensity: lightIntensity,
      angle: lightAngle,
    },
  };
}
