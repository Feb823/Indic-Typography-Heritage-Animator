# Hackathon Compliance & Judging Notes

This document cross-references our technical implementation with the official Google DeepMind Bangalore Hackathon guidelines.

---

## 🎖 Track & Focus Check
- **Track Selection:** Problem Statement 4 – *Conversational Video & Motion with Omni Flash*.
- **Model Usage:**
  - **Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`):** Ultra-fast pattern generator, responding in sub-2 seconds.
  - **Gemini Omni Flash (`gemini-omni-flash-preview`):** Multi-turn physics parsing, returning structured drape vectors conversational turn by turn.
- **Rule Verification:** 
  - Strictly NOT a simple RAG wrapper.
  - Strictly NOT a boilerplate dashboard or a chatbot.
  - An interactive, physics-driven visual simulation.

---

## 📊 Judging Criteria Alignment

### 1. Creativity & Originality (35% Weighting)
- **Concept:** Translating traditional Indian design terminology (e.g. "zari gold peacock motifs") into a live 3D drape animation.
- **Novelty:** Real-time chaining of image pattern synthesis (2D texture) directly into dynamic physical vertex deformations (3D motion drape).

### 2. Impact in India (25% Weighting)
- **Target Audience:** 3.5+ million traditional Indian handloom weavers and design artisans.
- **Problem Solved:** Physical textile prototyping is slow, costly, and manual. Artisans can now visualize draping fabric sheets, wind movements, and showroom lighting conditions using direct voice prompts.
- **Heritage Preservation:** Promotes classical Indian regional styles (Kanchipuram, Banarasi, Kalamkari, Ikat) in digital fashion.

### 3. Live Demo Execution (25% Weighting)
- **Performance:** Sub-2 second generation speed for the initial pattern.
- **Visual Feedback:** Sub-second physical rendering of wind forces and drape shapes using native canvas rendering.
- **Voice Control:** Hands-free voice commands using Web Speech API for rapid presentation flow.
- **Mock Fallback Resilience:** If WiFi fails or API keys are unavailable on stage, a high-fidelity local generator kicks in instantly, guaranteeing a functional demo.

### 4. Technical Depth (15% Weighting)
- **TypeScript Architecture:** Strict interfaces, zero `any` usage.
- **Structured JSON Schema:** Using Gemini Structured Outputs to strictly type and cast model responses into physical slider inputs, preventing text parsing errors.
- **Isolated AI Layer:** Modular service structures preventing API logic leak into UI layouts.
