# Indic-Typography Heritage Animator

An interactive, high-velocity fashion physics simulator and Generative AI fabric pattern designer created for the **Google DeepMind Bangalore Hackathon** (Track 4: Conversational Video & Motion with Omni Flash).

---

## 💥 The Core Innovation

Digital prototyping of traditional Indian handlooms (Kanchipuram, Banarasi, Kalamkari, Ikat) has historically been gatekept by slow 3D rendering times and manual CAD work, excluding millions of traditional artisans.

The **Indic-Typography Heritage Animator** breaks this barrier using a low-latency, dual-model generative AI pipeline:
1. **Nano Banana 2 Lite (`gemini-3.1-flash-lite-image`):** Generates a 1K tileable textile texture matching regional motifs in under 2 seconds.
2. **Gemini Omni Flash (`gemini-omni-flash-preview`):** Drives a conversational physics system, mapping the texture onto a mannequin drape and dynamically recalculating wind, gravity, lighting, and drape configurations via simple multi-turn dialogue.

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router, Tailwind CSS, TypeScript)
- **Animation:** Framer Motion (Micro-interactions & State Transitions)
- **Simulation Canvas:** HTML5 2D Canvas with mathematical vertex projection grid (Verlet integration)
- **AI Core:** `@google/genai` (Official Google GenAI Node.js SDK)
- **Voice Input:** Web Speech API (Natively integrated speech recognition)

---

## 🚀 Getting Started

### Prerequisites
- Node.js LTS (v24.x)
- NPM (v11.x)
- A Google Gemini API Key (stored in `.env.local` as `GEMINI_API_KEY`)

### Environment Setup
Create a `.env.local` file in the root directory:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Running Locally
To launch the development server:
```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
npm.cmd run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 🎨 Simulation & Keyboard Controls
When testing the visualizer sandbox, you can use the following interactive overrides:
- **[Spacebar]** - Instant heavy wind toggle.
- **[Left/Right Arrow Keys]** - Rotate lighting spotlight angle.
- **[Up/Down Arrow Keys]** - Adjust wind intensity manual override.
- **Voice Control** - Click the microphone button and say: *"drape as sari"*, *"add strong wind from left"*, or *"make it gold showroom lighting"*.
