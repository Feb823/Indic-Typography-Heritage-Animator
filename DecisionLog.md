# Architectural Decision Log (ADR)

This document tracks major technical decisions, trade-offs, and design pivots made during the development of the **Indic-Typography Heritage Animator**.

---

## ADR 01: Use of Native Math Canvas over Three.js/WebGL Shaders

- **Status:** Approved
- **Context:** The project requires visual draping simulations. Typically, this calls for WebGL (Three.js / React Three Fiber) with cloth shaders.
- **Decision:** We opted to build a custom vertex projection drape simulator directly in a standard HTML5 2D Canvas context.
- **Rationale:**
  - *Load Latency:* Three.js bundles add 500KB+ to the frontend size, leading to slower page initial loads, which hurts the live demo scoring.
  - *Setup Overhead:* Setting up cameras, lights, textures, and custom shaders can lead to bundler/types issues under hackathon speed.
  - *Sub-second Goal:* A mathematical vertex simulation inside a 2D Canvas renders at 60fps immediately without initializing complex WebGL contexts. It handles wind displacement, gravity, and texture coordinates using basic trigonometry.
- **Consequences:** We gain extreme performance and instant visual responses, though complex 3D mannequin geometry collision detection is simplified to an elliptical silhouette boundary.

---

## ADR 02: Dual-Mode AI Service Layer (Mock / Live Chaining)

- **Status:** Approved
- **Context:** External API dependencies are fragile during live pitches. Furthermore, the hackathon models (`gemini-3.1-flash-lite-image`, `gemini-omni-flash-preview`) may experience rate limits or require specialized billing keys.
- **Decision:** Implement a rigid dual-mode interface in `geminiService.ts` that immediately checks for `process.env.GEMINI_API_KEY` or a user-provided client key.
- **Rationale:**
  - If a key is missing or calls fail, it falls back to local procedural canvas/SVG generators which recreate authentic motifs instantly.
  - This guarantees a completely flawless presentation on stage without internet dependency.
- **Consequences:** Code complexity increases slightly to support two distinct backend rendering flows.

---

## ADR 03: Structured JSON Outputs for Physics Parameter Control

- **Status:** Approved
- **Context:** Translating natural language commands ("make it flow more") into numbers is error-prone. Free-text replies from LLMs require heavy regex parsing which fails when output formatting shifts.
- **Decision:** Enforce a strict JSON schema configuration via Gemini Omni Flash's response schema parameters.
- **Rationale:**
  - Forces the model to return a structured JSON object containing all required physics constants.
  - Fully eliminates regex parsing code on our API route handlers, enabling strict typing from LLM output directly into React states.
- **Consequences:** The LLM prompt must be carefully calibrated to avoid returning values outside the accepted physics ranges.

---

## ADR 04: Physics Grid Optimization & Relative Pinning Mappings

- **Status:** Approved
- **Context:** Render loops with a 15x15 grid (392 triangles) suffered from high canvas CPU clipping overhead, creating a laggy experience on less powerful devices. Additionally, hardcoded indices (e.g. `c > 10` on row 6) broke the Saree drape wrap shape when dimensions were resized.
- **Decision:** Reduced grid density to 10x10 (162 triangles) and refactored pinning coordinates to use relative percentage-based limits (`cols * 0.35` and `rows * 0.45`).
- **Rationale:**
  - *Lag Resolution:* Cutting the number of triangle draw calls by 60% immediately resolved rendering bottlenecks, achieving a stable 60fps.
  - *Dynamic Layouts:* Using relative indexing ensures the virtual Saree mannequin shape wraps and displays correctly regardless of the grid density.
- **Consequences:** Waves are slightly lower resolution, but the frame rate gains and mathematical stability make it much more suited for high-impact live demos.
