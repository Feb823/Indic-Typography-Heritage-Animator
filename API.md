# API Endpoint Documentation

This document specifies all client-server and server-AI API interfaces.

---

## 1. Pattern Generation Endpoint

Generates a seamless 1K heritage texture pattern using Nano Banana 2 Lite.

- **URL:** `/api/generate-pattern`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "prompt": "Gold zari Banarasi silk with peacock motifs",
    "style": "banarasi" 
  }
  ```
  *(Supported styles: `"banarasi"`, `"kanchipuram"`, `"kalamkari"`, `"ikat"`)*

- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "patternUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "promptUsed": "Rich Banarasi silk texture with gold zari thread work and detailed peacock motifs, high quality, seamless tileable pattern, 1K",
    "generationTimeMs": 1450,
    "isMocked": false
  }
  ```

- **Error Response (400 Bad Request):**
  ```json
  {
    "success": false,
    "error": "Prompt is required"
  }
  ```

---

## 2. Conversational Physics Endpoint

Refines drape physics variables using a multi-turn chat interaction with Gemini Omni Flash.

- **URL:** `/api/conversation`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "messages": [
      { "role": "user", "content": "Gold zari Banarasi silk with peacock motifs" },
      { "role": "model", "content": "I've generated a luxurious Banarasi pattern. How should we drape it?" },
      { "role": "user", "content": "Make it a heavy sari drape and add monsoon wind from the left" }
    ]
  }
  ```

- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": {
      "role": "model",
      "content": "Adjusted the drape to a heavy sari style. Simulating monsoon-force wind coming from the left, increasing gravity slightly to reflect the weight of Banarasi silk."
    },
    "physicsParams": {
      "windSpeed": 9.2,
      "windDirection": -90,
      "gravity": 11.2,
      "drapeStyle": "sari",
      "material": {
        "shininess": 0.85,
        "roughness": 0.25,
        "transparency": 0.0
      },
      "lighting": {
        "color": "#a8b8cc",
        "intensity": 0.55,
        "angle": 135
      }
    }
  }
  ```

- **Error Response (500 Internal Server Error):**
  ```json
  {
    "success": false,
    "error": "Failed to parse conversation parameter schema"
  }
  ```

---

## 3. Server-AI Integration (Google GenAI SDK)

The services internally interact with Vertex AI / Google GenAI SDK.

### Nano Banana 2 Lite Payload
- **Model:** `gemini-3.1-flash-lite-image`
- **API Call Type:** `generateImages`
- **Aspect Ratio:** `1:1`
- **Number of Images:** `1`

### Gemini Omni Flash Structured Output Configuration
- **Model:** `gemini-omni-flash-preview`
- **Schema Validation:**
  ```json
  {
    "type": "OBJECT",
    "properties": {
      "explanation": { "type": "STRING" },
      "windSpeed": { "type": "NUMBER" },
      "windDirection": { "type": "NUMBER" },
      "gravity": { "type": "NUMBER" },
      "drapeStyle": { "type": "STRING", "enum": ["sari", "kurta", "dupatta", "draped-sheet"] },
      "shininess": { "type": "NUMBER" },
      "roughness": { "type": "NUMBER" },
      "transparency": { "type": "NUMBER" },
      "lightColor": { "type": "STRING" },
      "lightIntensity": { "type": "NUMBER" }
    },
    "required": ["explanation", "windSpeed", "windDirection", "gravity", "drapeStyle", "shininess", "roughness", "transparency", "lightColor", "lightIntensity"]
  }
  ```
