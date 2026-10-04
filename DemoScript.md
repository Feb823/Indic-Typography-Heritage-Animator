# Live Demo Pitch Script (3 Minutes)

This document contains the presentation script, timecodes, visual cues, and Q&A playbook for the pitch panel.

---

## ⏱ Timecode Breakdown

### 0:00 - 0:30 | The Hook & The Problem
- **Speaker Action:** Open the web sandbox. Show the clean, dark-mode heritage visualizer with the default gold Banarasi pattern draping on the mannequin.
- **Script:**
  > "Hello judges! Today, we are bridging ancient Indian craftsmanship with real-time generative physics. Over 3.5 million artisans in India weave Kanchipuram, Banarasi, and Kalamkari textiles, yet digital prototyping remains gatekept behind complex, slow 3D CAD tools.
  > 
  > Meet the **Indic-Typography Heritage Animator**—a live, conversational design engine that translates regional motif descriptions directly into physical fabric simulations."

### 0:30 - 1:15 | Generation & Pattern Design (NB2 Lite)
- **Speaker Action:** Click the microphone button and dictate a prompt: *"Crimson Kalamkari silk with golden floral vines"*.
- **Visual Event:** The prompt loads. In under 2 seconds, a gorgeous seamless Kalamkari pattern fills the visualizer and wraps around the mannequin.
- **Script:**
  > "Watch this. I'll dictate a pattern: *'Crimson Kalamkari silk with golden floral vines'*.
  > 
  > Instantly, our **Nano Banana 2 Lite** service renders a seamless 1K fabric texture in under 2 seconds. The system immediately maps this texture onto our mannequin. No loading screens, no heavy waiting."

### 1:15 - 2:15 | Conversational Drape & Physics (Gemini Omni Flash)
- **Speaker Action:** In the chat input, type: *"increase monsoon wind from left, and make the lighting warmer"*.
- **Visual Event:** The simulation instantly accelerates its wind ripples, changes direction, and shifts the ambient spotlight to deep warm gold. Sliders on the right panel slide automatically to their new values.
- **Script:**
  > "Now, how does this fabric behave in real-world spaces? We use **Gemini Omni Flash** to interpret conversational physics. I'll type: *'increase monsoon wind from left, and make the lighting warmer'*.
  > 
  > Look at the simulation. Gemini parses this statement, extracts the physical vectors, and updates our mathematical canvas. The wind direction rotates, the gravity balances, and the spotlight warms up, simulating actual showroom lighting on Kalamkari silk."

### 2:15 - 3:00 | Impact & Wrap Up
- **Speaker Action:** Show the pattern showcase history at the bottom. Trigger a confetti burst on completion.
- **Script:**
  > "Our physics visualizer delivers sub-second rendering, offering designers and weavers instant feedback. By combining the speed of Nano Banana 2 Lite with the conversational depth of Omni Flash, we democratize digital textile prototyping for weavers in Kanchipuram and Varanasi.
  > 
  > Heritage meets modern tech. Thank you, and we'd love to take your questions!"

---

## 🙋 Q&A Playbook (Anticipated Questions)

### Q1: How does the drape physics simulation work without loading heavy engines?
- **Answer:** *"To ensure instant load times and fluid 60fps renders on mobile devices, we built a custom Verlet-integration grid directly in HTML5 Canvas. It displaces vertices mathematically using wind vectors and drape boundaries, mapping the generated 1K texture coordinates dynamically."*

### Q2: How does the system handle internet latency or API downtime?
- **Answer:** *"We designed a dual-mode integration. If the Gemini API key is missing or calls time out, our service layer falls back to a high-speed local procedural generator that renders genuine Kanchipuram or Kalamkari patterns instantly. This guarantees our demo will never crash on stage."*
