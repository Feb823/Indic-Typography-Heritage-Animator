const fs = require('fs');
const path = require('path');

// Helper to write multiple meshes into a single binary buffer and return glTF JSON
function buildMultiMeshGltf(meshes, isFemale, filename) {
  // Compute total sizes
  let totalSize = 0;
  const meshBufferInfos = [];

  for (const m of meshes) {
    const vCount = m.vertices.length / 3;
    const iCount = m.indices.length;

    const vSize = vCount * 12; // Float32 x 3
    const nSize = vCount * 12; // Float32 x 3
    const uSize = vCount * 8;  // Float32 x 2
    const iSize = iCount * 2;  // Uint16

    meshBufferInfos.push({
      meshName: m.name,
      vCount,
      iCount,
      vSize,
      nSize,
      uSize,
      iSize,
      byteOffset: totalSize,
    });

    totalSize += vSize + nSize + uSize + iSize;
  }

  // Allocate combined buffer
  const buffer = Buffer.alloc(totalSize);
  let currentOffset = 0;

  for (let mIdx = 0; mIdx < meshes.length; mIdx++) {
    const m = meshes[mIdx];
    const info = meshBufferInfos[mIdx];

    info.vOffset = currentOffset;
    for (let i = 0; i < m.vertices.length; i++) {
      buffer.writeFloatLE(m.vertices[i], currentOffset);
      currentOffset += 4;
    }

    info.nOffset = currentOffset;
    for (let i = 0; i < m.normals.length; i++) {
      buffer.writeFloatLE(m.normals[i], currentOffset);
      currentOffset += 4;
    }

    info.uOffset = currentOffset;
    for (let i = 0; i < m.uvs.length; i++) {
      buffer.writeFloatLE(m.uvs[i], currentOffset);
      currentOffset += 4;
    }

    info.iOffset = currentOffset;
    for (let i = 0; i < m.indices.length; i++) {
      buffer.writeUInt16LE(m.indices[i], currentOffset);
      currentOffset += 2;
    }
  }

  const base64Buffer = buffer.toString('base64');

  // Build glTF structures
  const gltfMeshes = [];
  const gltfNodes = [];
  const bufferViews = [];
  const accessors = [];

  // Add root node
  gltfNodes.push({
    name: "RootNode",
    children: [1, 2, 3, 4, 5]
  });

  const shoulderWidth = isFemale ? 0.35 : 0.45;
  const hipWidth = isFemale ? 0.35 : 0.36;

  // Segment pivot translation coordinates
  const nodeTranslations = {
    HeadTorso: [0, 0, 0],
    LeftArm: [-shoulderWidth / 2 - 0.025, 0.46, 0],
    RightArm: [shoulderWidth / 2 + 0.025, 0.46, 0],
    LeftLeg: [-hipWidth / 4.2, -0.19, 0],
    RightLeg: [hipWidth / 4.2, -0.19, 0]
  };

  for (let i = 0; i < meshes.length; i++) {
    const m = meshes[i];
    const info = meshBufferInfos[i];
    const nodeName = info.meshName;

    // Define mesh
    gltfMeshes.push({
      primitives: [
        {
          attributes: {
            POSITION: i * 4 + 1,
            NORMAL: i * 4 + 2,
            TEXCOORD_0: i * 4 + 3
          },
          indices: i * 4,
          mode: 4 // Triangles
        }
      ],
      name: nodeName + "Mesh"
    });

    // Define node referencing mesh
    gltfNodes.push({
      name: nodeName,
      mesh: i,
      translation: nodeTranslations[nodeName] || [0, 0, 0]
    });

    // Define 4 distinct bufferViews for this mesh
    const viewIdxIndex = i * 4;
    const viewIdxPos = i * 4 + 1;
    const viewIdxNorm = i * 4 + 2;
    const viewIdxUv = i * 4 + 3;

    bufferViews.push({
      buffer: 0,
      byteOffset: info.iOffset,
      byteLength: info.iSize,
      target: 34963 // ELEMENT_ARRAY_BUFFER
    });

    bufferViews.push({
      buffer: 0,
      byteOffset: info.vOffset,
      byteLength: info.vSize,
      target: 34962 // ARRAY_BUFFER
    });

    bufferViews.push({
      buffer: 0,
      byteOffset: info.nOffset,
      byteLength: info.nSize,
      target: 34962 // ARRAY_BUFFER
    });

    bufferViews.push({
      buffer: 0,
      byteOffset: info.uOffset,
      byteLength: info.uSize,
      target: 34962 // ARRAY_BUFFER
    });

    // Calculate bounding box for positions
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let k = 0; k < m.vertices.length; k += 3) {
      const vx = m.vertices[k];
      const vy = m.vertices[k+1];
      const vz = m.vertices[k+2];
      if (vx < minX) minX = vx; if (vx > maxX) maxX = vx;
      if (vy < minY) minY = vy; if (vy > maxY) maxY = vy;
      if (vz < minZ) minZ = vz; if (vz > maxZ) maxZ = vz;
    }

    // Accessors
    accessors.push({
      bufferView: viewIdxIndex,
      byteOffset: 0,
      componentType: 5123, // UNSIGNED_SHORT
      count: info.iCount,
      type: "SCALAR",
      max: [info.vCount - 1],
      min: [0]
    });

    accessors.push({
      bufferView: viewIdxPos,
      byteOffset: 0,
      componentType: 5126, // FLOAT
      count: info.vCount,
      type: "VEC3",
      max: [maxX, maxY, maxZ],
      min: [minX, minY, minZ]
    });

    accessors.push({
      bufferView: viewIdxNorm,
      byteOffset: 0,
      componentType: 5126, // FLOAT
      count: info.vCount,
      type: "VEC3",
      max: [1.0, 1.0, 1.0],
      min: [-1.0, -1.0, -1.0]
    });

    accessors.push({
      bufferView: viewIdxUv,
      byteOffset: 0,
      componentType: 5126, // FLOAT
      count: info.vCount,
      type: "VEC2",
      max: [1.0, 1.0],
      min: [0.0, 0.0]
    });
  }

  const gltfJson = {
    asset: {
      version: "2.0",
      generator: "Indic Modular Mannequin Builder"
    },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: gltfNodes,
    meshes: gltfMeshes,
    buffers: [{
      uri: `data:application/octet-stream;base64,${base64Buffer}`,
      byteLength: totalSize
    }],
    bufferViews,
    accessors
  };

  const outputPath = path.join(__dirname, 'public', filename);
  fs.writeFileSync(outputPath, JSON.stringify(gltfJson, null, 2));
  console.log(`Generated modular glTF: ${filename} (${(totalSize / 1024).toFixed(1)} KB)`);
}

// Generate a smooth lofted tube mesh
function generateLoftedMesh(name, slices, segments, uvScaleX = 1, uvScaleY = 1) {
  const vertices = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let s = 0; s < slices.length; s++) {
    const slice = slices[s];
    const t = s / (slices.length - 1);
    
    for (let seg = 0; seg <= segments; seg++) {
      const angle = (seg / segments) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const px = slice.cx + cos * slice.rx;
      const py = slice.y;
      const pz = slice.cz + sin * slice.rz;

      const nx = cos;
      const ny = 0;
      const nz = sin;
      const len = Math.hypot(nx, ny, nz) || 1;
      
      vertices.push(px, py, pz);
      normals.push(nx / len, ny / len, nz / len);
      uvs.push((seg / segments) * uvScaleX, t * uvScaleY);
    }
  }

  const verticesPerSlice = segments + 1;
  for (let s = 0; s < slices.length - 1; s++) {
    for (let seg = 0; seg < segments; seg++) {
      const i00 = s * verticesPerSlice + seg;
      const i10 = i00 + 1;
      const i01 = i00 + verticesPerSlice;
      const i11 = i01 + 1;

      indices.push(i00, i10, i01);
      indices.push(i10, i11, i01);
    }
  }

  return { name, vertices, normals, uvs, indices };
}

// === GENERATE DUMMIES ===

// 1. FEMALE MODULAR MANNEQUIN
const femaleMeshes = [];

// A. Head & Torso & Hips (continuous smooth loft, local center y pivot = 0)
const fTorsoSlices = [
  { y: -0.19, rx: 0.175, rz: 0.145, cx: 0, cz: 0 },
  { y: -0.10, rx: 0.178, rz: 0.148, cx: 0, cz: 0.01 },
  { y: 0.00,  rx: 0.180, rz: 0.150, cx: 0, cz: 0.01 },
  { y: 0.10,  rx: 0.145, rz: 0.125, cx: 0, cz: 0.00 },
  { y: 0.20,  rx: 0.105, rz: 0.090, cx: 0, cz: -0.01 },
  { y: 0.30,  rx: 0.125, rz: 0.105, cx: 0, cz: -0.01 },
  { y: 0.40,  rx: 0.160, rz: 0.155, cx: 0, cz: 0.02 }, // bust curves
  { y: 0.48,  rx: 0.168, rz: 0.130, cx: 0, cz: 0.01 },
  { y: 0.52,  rx: 0.175, rz: 0.100, cx: 0, cz: -0.01 },
  { y: 0.58,  rx: 0.046, rz: 0.046, cx: 0, cz: -0.01 },
  { y: 0.65,  rx: 0.042, rz: 0.042, cx: 0, cz: -0.01 },
  { y: 0.69,  rx: 0.080, rz: 0.090, cx: 0, cz: 0.01 },
  { y: 0.75,  rx: 0.110, rz: 0.120, cx: 0, cz: 0.01 },
  { y: 0.81,  rx: 0.090, rz: 0.100, cx: 0, cz: 0.01 },
  { y: 0.85,  rx: 0.030, rz: 0.030, cx: 0, cz: 0.00 }
];
femaleMeshes.push(generateLoftedMesh('HeadTorso', fTorsoSlices, 24));

// B. Left Arm
const fLArmSlices = [
  { y: 0.00,  rx: 0.034, rz: 0.034, cx: 0, cz: 0 },
  { y: -0.18, rx: 0.031, rz: 0.031, cx: 0, cz: 0 },
  { y: -0.35, rx: 0.028, rz: 0.028, cx: 0, cz: 0 },
  { y: -0.51, rx: 0.025, rz: 0.025, cx: 0, cz: 0 },
  { y: -0.61, rx: 0.022, rz: 0.022, cx: 0, cz: 0 },
  { y: -0.68, rx: 0.026, rz: 0.012, cx: 0, cz: 0 }  // Hand
];
femaleMeshes.push(generateLoftedMesh('LeftArm', fLArmSlices, 12));

// C. Right Arm
const fRArmSlices = [
  { y: 0.00,  rx: 0.034, rz: 0.034, cx: 0, cz: 0 },
  { y: -0.18, rx: 0.031, rz: 0.031, cx: 0, cz: 0 },
  { y: -0.35, rx: 0.028, rz: 0.028, cx: 0, cz: 0 },
  { y: -0.51, rx: 0.025, rz: 0.025, cx: 0, cz: 0 },
  { y: -0.61, rx: 0.022, rz: 0.022, cx: 0, cz: 0 },
  { y: -0.68, rx: 0.026, rz: 0.012, cx: 0, cz: 0 }
];
femaleMeshes.push(generateLoftedMesh('RightArm', fRArmSlices, 12));

// D. Left Leg
const fLLegSlices = [
  { y: 0.00,  rx: 0.080, rz: 0.080, cx: 0, cz: 0 },
  { y: -0.23, rx: 0.068, rz: 0.068, cx: 0, cz: 0 },
  { y: -0.45, rx: 0.055, rz: 0.055, cx: 0, cz: 0 }, // Knee
  { y: -0.66, rx: 0.048, rz: 0.048, cx: 0, cz: 0 },
  { y: -0.90, rx: 0.036, rz: 0.036, cx: 0, cz: 0 }, // Ankle
  { y: -0.94, rx: 0.042, rz: 0.075, cx: 0, cz: 0.035 } // Foot
];
femaleMeshes.push(generateLoftedMesh('LeftLeg', fLLegSlices, 16));

// E. Right Leg
const fRLegSlices = [
  { y: 0.00,  rx: 0.080, rz: 0.080, cx: 0, cz: 0 },
  { y: -0.23, rx: 0.068, rz: 0.068, cx: 0, cz: 0 },
  { y: -0.45, rx: 0.055, rz: 0.055, cx: 0, cz: 0 },
  { y: -0.66, rx: 0.048, rz: 0.048, cx: 0, cz: 0 },
  { y: -0.90, rx: 0.036, rz: 0.036, cx: 0, cz: 0 },
  { y: -0.94, rx: 0.042, rz: 0.075, cx: 0, cz: 0.035 }
];
femaleMeshes.push(generateLoftedMesh('RightLeg', fRLegSlices, 16));

buildMultiMeshGltf(femaleMeshes, true, 'femaleMannequin.gltf');


// 2. MALE MODULAR MANNEQUIN
const maleMeshes = [];

// A. Head & Torso & Hips (masculine broad proportions)
const mTorsoSlices = [
  { y: -0.19, rx: 0.180, rz: 0.140, cx: 0, cz: 0 },
  { y: -0.10, rx: 0.180, rz: 0.140, cx: 0, cz: 0.01 },
  { y: 0.00,  rx: 0.180, rz: 0.142, cx: 0, cz: 0.01 },
  { y: 0.10,  rx: 0.165, rz: 0.130, cx: 0, cz: 0.00 },
  { y: 0.22,  rx: 0.160, rz: 0.125, cx: 0, cz: 0.00 },
  { y: 0.32,  rx: 0.185, rz: 0.135, cx: 0, cz: 0.00 },
  { y: 0.45,  rx: 0.210, rz: 0.145, cx: 0, cz: 0.01 }, // broad chest
  { y: 0.54,  rx: 0.225, rz: 0.120, cx: 0, cz: -0.01 },
  { y: 0.60,  rx: 0.056, rz: 0.056, cx: 0, cz: -0.01 },
  { y: 0.67,  rx: 0.052, rz: 0.052, cx: 0, cz: -0.01 },
  { y: 0.71,  rx: 0.088, rz: 0.098, cx: 0, cz: 0.01 },
  { y: 0.77,  rx: 0.118, rz: 0.128, cx: 0, cz: 0.01 },
  { y: 0.83,  rx: 0.098, rz: 0.108, cx: 0, cz: 0.01 },
  { y: 0.87,  rx: 0.030, rz: 0.030, cx: 0, cz: 0.00 }
];
maleMeshes.push(generateLoftedMesh('HeadTorso', mTorsoSlices, 24));

// B. Left Arm
const mLArmSlices = [
  { y: 0.00,  rx: 0.046, rz: 0.046, cx: 0, cz: 0 },
  { y: -0.18, rx: 0.042, rz: 0.042, cx: 0, cz: 0 },
  { y: -0.35, rx: 0.038, rz: 0.038, cx: 0, cz: 0 },
  { y: -0.51, rx: 0.035, rz: 0.035, cx: 0, cz: 0 },
  { y: -0.61, rx: 0.030, rz: 0.030, cx: 0, cz: 0 },
  { y: -0.68, rx: 0.035, rz: 0.016, cx: 0, cz: 0 }  // Hand
];
maleMeshes.push(generateLoftedMesh('LeftArm', mLArmSlices, 12));

// C. Right Arm
const mRArmSlices = [
  { y: 0.00,  rx: 0.046, rz: 0.046, cx: 0, cz: 0 },
  { y: -0.18, rx: 0.042, rz: 0.042, cx: 0, cz: 0 },
  { y: -0.35, rx: 0.038, rz: 0.038, cx: 0, cz: 0 },
  { y: -0.51, rx: 0.035, rz: 0.035, cx: 0, cz: 0 },
  { y: -0.61, rx: 0.030, rz: 0.030, cx: 0, cz: 0 },
  { y: -0.68, rx: 0.035, rz: 0.016, cx: 0, cz: 0 }
];
maleMeshes.push(generateLoftedMesh('RightArm', mRArmSlices, 12));

// D. Left Leg
const mLLegSlices = [
  { y: 0.00,  rx: 0.105, rz: 0.105, cx: 0, cz: 0 },
  { y: -0.23, rx: 0.088, rz: 0.088, cx: 0, cz: 0 },
  { y: -0.45, rx: 0.075, rz: 0.075, cx: 0, cz: 0 },
  { y: -0.66, rx: 0.065, rz: 0.065, cx: 0, cz: 0 },
  { y: -0.90, rx: 0.048, rz: 0.048, cx: 0, cz: 0 },
  { y: -0.94, rx: 0.052, rz: 0.092, cx: 0, cz: 0.040 } // Foot
];
maleMeshes.push(generateLoftedMesh('LeftLeg', mLLegSlices, 16));

// E. Right Leg
const mRLegSlices = [
  { y: 0.00,  rx: 0.105, rz: 0.105, cx: 0, cz: 0 },
  { y: -0.23, rx: 0.088, rz: 0.088, cx: 0, cz: 0 },
  { y: -0.45, rx: 0.075, rz: 0.075, cx: 0, cz: 0 },
  { y: -0.66, rx: 0.065, rz: 0.065, cx: 0, cz: 0 },
  { y: -0.90, rx: 0.048, rz: 0.048, cx: 0, cz: 0 },
  { y: -0.94, rx: 0.052, rz: 0.092, cx: 0, cz: 0.040 }
];
maleMeshes.push(generateLoftedMesh('RightLeg', mRLegSlices, 16));

buildMultiMeshGltf(maleMeshes, false, 'maleMannequin.gltf');
