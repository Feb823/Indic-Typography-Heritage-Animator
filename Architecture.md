# System Architecture

This document describes the architectural design, component layout, data flow, and technology choices for the **Indic-Typography Heritage Animator**.

## 1. System Topology

The application is structured as a monolithic Next.js App Router project written in TypeScript. We split concerns between a Client-Side interactive canvas/voice visualizer and Server-Side API endpoints that encapsulate the GenAI calls.

```mermaid
graph TD
    Client[Next.js Client SPA]
    APIs[Next.js App Router API Routes]
    Gemini[Google GenAI SDK API]

    Client -->|1. Submit Prompt / Speech| APIs
    APIs -->|2. Invoke NB2 Lite / Omni Flash| Gemini
    Gemini -->|3. Return Texture & structured physics JSON| APIs
    APIs -->|4. Pass Assets & parameters| Client
    Client -->|5. Update 3D canvas drape| Visualizer[Canvas WebGL Drape Engine]
```

---

## 2. Component Design & Responsibilities

- **`page.tsx` (Main Page):** Handles root application state, including current texture image URL, wind strength, drape mode, conversational message list, and error handling.
- **`CanvasVisualizer.tsx`:** An HTML5 Canvas component utilizing mathematical vertex displacement. It renders:
  - Mannequin contour silhouette.
  - Generative fabric grid mapped to a 3D-deformed surface.
  - Verlet-integration drape animation based on wind velocity, wave frequency, gravity, and fabric drag.
- **`VoiceInput.tsx`:** Integrates the browser's native `webkitSpeechRecognition` to provide hands-free voice control.
- **`ChatPanel.tsx`:** Standard chat window allowing the user to type conversational adjustments.
- **`geminiService.ts`:** Centralized service containing:
  - `generatePattern(prompt: string): Promise<string>` - Image generation with Nano Banana 2 Lite.
  - `refinePhysics(messages: Message[]): Promise<PhysicsParams>` - Physics translation with Gemini Omni Flash.
- **`mockService.ts`:** Renders high-fidelity, high-speed procedural textures (Banarasi, Kalamkari, Ikat) on-the-fly when the API is disabled or offline, ensuring sub-second execution speeds.

---

## 3. Sequenced Operations Flow

The sequence below illustrates the fabric pattern creation and subsequent conversational physics refinement:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Page as Sandbox Page
    participant API as Next.js API
    participant AI as Gemini Service
    participant Canvas as Canvas Drape Engine

    User->>Page: Speak / Type Motif Prompt
    Page->>API: POST /api/generate-pattern { prompt, style }
    API->>AI: Call Nano Banana 2 Lite (Image Gen)
    Note over AI: Render 1K Seamless Heritage Pattern
    AI-->>API: Image Base64 / URL
    API-->>Page: Return Pattern Data
    Page->>Canvas: Render texture update
    Canvas-->>User: Visual feedback (Drape updating)

    User->>Page: Type Command ("Increase monsoon wind")
    Page->>API: POST /api/conversation { messageHistory }
    API->>AI: Call Gemini Omni Flash (Structured JSON output)
    Note over AI: Parse "monsoon wind" -> { windSpeed: 8.5, gravity: 9.8 }
    AI-->>API: Return Physics JSON
    API-->>Page: Return Physics Params + text response
    Page->>Canvas: Apply new physics values (Lerp transitions)
    Canvas-->>User: Fabric waves heavily in real time
```

---

## 4. Technology Decisions Rationale

1. **Next.js App Router (TypeScript):** Provides unified client and server-side codebases. Type safety prevents runtime property failures.
2. **HTML5 Canvas (2D Context with Math Vertex projection):** Rather than loading heavy 3D rendering engines (like Three.js), which take seconds to compile and load, we use a high-performance 2D Canvas with a calculated 3D deformation grid. This ensures sub-millisecond drawing routines and instant layout loads, achieving the hackathon goal of **sub-second visual feedback**.
3. **Structured Outputs (JSON Schema):** We force Gemini Omni Flash to return a specific JSON schema. This completely eliminates regex parsing errors and guarantees that the physics engine receives exact numerical constants.
