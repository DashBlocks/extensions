/* Author: ABDev */
(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Ultra3D Engine must be run unsandboxed");
  }

  const MathUtils = {
    degToRad: (d) => (d * Math.PI) / 180,
    radToDeg: (r) => (r * 180) / Math.PI,
    clamp: (v, min, max) => Math.max(min, Math.min(max, v)),
    lerp: (a, b, t) => a + (b - a) * t,
  };

  class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x; this.y = y; this.z = z;
    }
    clone() { return new Vec3(this.x, this.y, this.z); }
    set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    add(v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
    sub(v) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
    scale(s) { return new Vec3(this.x * s, this.y * s, this.z * s); }
    dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
    cross(v) {
      return new Vec3(
        this.y * v.z - this.z * v.y,
        this.z * v.x - this.x * v.z,
        this.x * v.y - this.y * v.x
      );
    }
    length() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
    normalize() {
      const l = this.length();
      if (l === 0) return new Vec3();
      return this.scale(1 / l);
    }
    distanceTo(v) { return this.sub(v).length(); }
    toArray() { return [this.x, this.y, this.z]; }
  }

  class Mat4 {
    constructor() { this.data = Mat4.identity(); }
    static identity() {
      return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]);
    }
    static multiply(a, b) {
      const r = new Float32Array(16);
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          r[j * 4 + i] =
            a[0 * 4 + i] * b[j * 4 + 0] +
            a[1 * 4 + i] * b[j * 4 + 1] +
            a[2 * 4 + i] * b[j * 4 + 2] +
            a[3 * 4 + i] * b[j * 4 + 3];
        }
      }
      return r;
    }
    static perspective(fovRad, aspect, near, far) {
      const f = 1.0 / Math.tan(fovRad / 2);
      const nf = 1 / (near - far);
      const m = new Float32Array(16);
      m[0] = f / aspect; m[5] = f;
      m[10] = (far + near) * nf; m[11] = -1;
      m[14] = 2 * far * near * nf;
      return m;
    }
    static ortho(left, right, bottom, top, near, far) {
      const m = new Float32Array(16);
      const lr = 1 / (left - right);
      const bt = 1 / (bottom - top);
      const nf = 1 / (near - far);
      m[0] = -2 * lr; m[5] = -2 * bt; m[10] = 2 * nf;
      m[12] = (left + right) * lr;
      m[13] = (top + bottom) * bt;
      m[14] = (far + near) * nf;
      m[15] = 1;
      return m;
    }
    static lookAt(eye, center, up) {
      const z = eye.sub(center).normalize();
      const x = up.cross(z).normalize();
      const y = z.cross(x).normalize();
      const m = new Float32Array(16);
      m[0] = x.x; m[1] = y.x; m[2] = z.x;
      m[4] = x.y; m[5] = y.y; m[6] = z.y;
      m[8] = x.z; m[9] = y.z; m[10] = z.z;
      m[12] = -x.dot(eye); m[13] = -y.dot(eye); m[14] = -z.dot(eye);
      m[15] = 1;
      return m;
    }
    static translation(x, y, z) {
      const m = Mat4.identity();
      m[12] = x; m[13] = y; m[14] = z;
      return m;
    }
    static scaling(x, y, z) {
      const m = Mat4.identity();
      m[0] = x; m[5] = y; m[10] = z;
      return m;
    }
    static rotationX(rad) {
      const m = Mat4.identity();
      const c = Math.cos(rad), s = Math.sin(rad);
      m[5] = c; m[6] = s; m[9] = -s; m[10] = c;
      return m;
    }
    static rotationY(rad) {
      const m = Mat4.identity();
      const c = Math.cos(rad), s = Math.sin(rad);
      m[0] = c; m[2] = -s; m[8] = s; m[10] = c;
      return m;
    }
    static rotationZ(rad) {
      const m = Mat4.identity();
      const c = Math.cos(rad), s = Math.sin(rad);
      m[0] = c; m[1] = s; m[4] = -s; m[5] = c;
      return m;
    }
    static inverse(m) {
      const inv = new Float32Array(16);
      const s = m;
      inv[0] = s[5]*s[10]*s[15]-s[5]*s[11]*s[14]-s[9]*s[6]*s[15]+s[9]*s[7]*s[14]+s[13]*s[6]*s[11]-s[13]*s[7]*s[10];
      inv[4] = -s[4]*s[10]*s[15]+s[4]*s[11]*s[14]+s[8]*s[6]*s[15]-s[8]*s[7]*s[14]-s[12]*s[6]*s[11]+s[12]*s[7]*s[10];
      inv[8] = s[4]*s[9]*s[15]-s[4]*s[11]*s[13]-s[8]*s[5]*s[15]+s[8]*s[7]*s[13]+s[12]*s[5]*s[11]-s[12]*s[7]*s[9];
      inv[12] = -s[4]*s[9]*s[14]+s[4]*s[10]*s[13]+s[8]*s[5]*s[14]-s[8]*s[6]*s[13]-s[12]*s[5]*s[10]+s[12]*s[6]*s[9];
      inv[1] = -s[1]*s[10]*s[15]+s[1]*s[11]*s[14]+s[9]*s[2]*s[15]-s[9]*s[3]*s[14]-s[13]*s[2]*s[11]+s[13]*s[3]*s[10];
      inv[5] = s[0]*s[10]*s[15]-s[0]*s[11]*s[14]-s[8]*s[2]*s[15]+s[8]*s[3]*s[14]+s[12]*s[2]*s[11]-s[12]*s[3]*s[10];
      inv[9] = -s[0]*s[9]*s[15]+s[0]*s[11]*s[13]+s[8]*s[1]*s[15]-s[8]*s[3]*s[13]-s[12]*s[1]*s[11]+s[12]*s[3]*s[9];
      inv[13] = s[0]*s[9]*s[14]-s[0]*s[10]*s[13]-s[8]*s[1]*s[14]+s[8]*s[2]*s[13]+s[12]*s[1]*s[10]-s[12]*s[2]*s[9];
      inv[2] = s[1]*s[6]*s[15]-s[1]*s[7]*s[14]-s[5]*s[2]*s[15]+s[5]*s[3]*s[14]+s[13]*s[2]*s[7]-s[13]*s[3]*s[6];
      inv[6] = -s[0]*s[6]*s[15]+s[0]*s[7]*s[14]+s[4]*s[2]*s[15]-s[4]*s[3]*s[14]-s[12]*s[2]*s[7]+s[12]*s[3]*s[6];
      inv[10] = s[0]*s[5]*s[15]-s[0]*s[7]*s[13]-s[4]*s[1]*s[15]+s[4]*s[3]*s[13]+s[12]*s[1]*s[7]-s[12]*s[3]*s[5];
      inv[14] = -s[0]*s[5]*s[14]+s[0]*s[6]*s[13]+s[4]*s[1]*s[14]-s[4]*s[2]*s[13]-s[12]*s[1]*s[6]+s[12]*s[2]*s[5];
      inv[3] = -s[1]*s[6]*s[11]+s[1]*s[7]*s[10]+s[5]*s[2]*s[11]-s[5]*s[3]*s[10]-s[9]*s[2]*s[7]+s[9]*s[3]*s[6];
      inv[7] = s[0]*s[6]*s[11]-s[0]*s[7]*s[10]-s[4]*s[2]*s[11]+s[4]*s[3]*s[10]+s[8]*s[2]*s[7]-s[8]*s[3]*s[6];
      inv[11] = -s[0]*s[5]*s[11]+s[0]*s[7]*s[9]+s[4]*s[1]*s[11]-s[4]*s[3]*s[9]-s[8]*s[1]*s[7]+s[8]*s[3]*s[5];
      inv[15] = s[0]*s[5]*s[10]-s[0]*s[6]*s[9]-s[4]*s[1]*s[10]+s[4]*s[2]*s[9]+s[8]*s[1]*s[6]-s[8]*s[2]*s[5];
      let det = s[0]*inv[0]+s[1]*inv[4]+s[2]*inv[8]+s[3]*inv[12];
      if (det === 0) return Mat4.identity();
      det = 1.0 / det;
      for (let i = 0; i < 16; i++) inv[i] *= det;
      return inv;
    }
    static transpose(m) {
      const r = new Float32Array(16);
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++)
          r[j * 4 + i] = m[i * 4 + j];
      return r;
    }
  }

  const SHADERS = {
    
    mainVert: `#version 300 es
      precision highp float;
      
      layout(location=0) in vec3 aPosition;
      layout(location=1) in vec3 aNormal;
      layout(location=2) in vec2 aUV;
      layout(location=3) in vec3 aColor;
      
      uniform mat4 uModel;
      uniform mat4 uView;
      uniform mat4 uProjection;
      uniform mat4 uNormalMatrix;
      uniform mat4 uLightSpaceMatrix;
      
      out vec3 vWorldPos;
      out vec3 vNormal;
      out vec2 vUV;
      out vec3 vColor;
      out vec4 vLightSpacePos;
      
      void main() {
        vec4 worldPos = uModel * vec4(aPosition, 1.0);
        vWorldPos = worldPos.xyz;
        vNormal = mat3(uNormalMatrix) * aNormal;
        vUV = aUV;
        vColor = aColor;
        vLightSpacePos = uLightSpaceMatrix * worldPos;
        gl_Position = uProjection * uView * worldPos;
      }
    `,

    mainFrag: `#version 300 es
      precision highp float;
      
      in vec3 vWorldPos;
      in vec3 vNormal;
      in vec2 vUV;
      in vec3 vColor;
      in vec4 vLightSpacePos;

      uniform vec3 uBaseColor;
      uniform float uMetallic;
      uniform float uRoughness;
      uniform float uOpacity;
      uniform vec3 uEmissive;
      uniform bool uUseVertexColors;
      uniform bool uUseTexture;
      uniform sampler2D uTexture;

      #define MAX_LIGHTS 16
      uniform int uNumLights;
      uniform vec3 uLightPositions[MAX_LIGHTS];
      uniform vec3 uLightColors[MAX_LIGHTS];
      uniform float uLightIntensities[MAX_LIGHTS];
      uniform int uLightTypes[MAX_LIGHTS]; 
      uniform vec3 uLightDirections[MAX_LIGHTS];
      uniform float uLightCutoffs[MAX_LIGHTS];
      uniform float uLightOuterCutoffs[MAX_LIGHTS];
      
      uniform vec3 uAmbientColor;
      uniform float uAmbientIntensity;
      uniform vec3 uCameraPos;

      uniform bool uFogEnabled;
      uniform vec3 uFogColor;
      uniform float uFogNear;
      uniform float uFogFar;

      uniform bool uShadowEnabled;
      uniform sampler2D uShadowMap;
      
      out vec4 fragColor;
      
      const float PI = 3.14159265359;

      float DistributionGGX(vec3 N, vec3 H, float roughness) {
        float a = roughness * roughness;
        float a2 = a * a;
        float NdotH = max(dot(N, H), 0.0);
        float NdotH2 = NdotH * NdotH;
        float denom = NdotH2 * (a2 - 1.0) + 1.0;
        return a2 / (PI * denom * denom);
      }
      
      float GeometrySchlickGGX(float NdotV, float roughness) {
        float r = roughness + 1.0;
        float k = (r * r) / 8.0;
        return NdotV / (NdotV * (1.0 - k) + k);
      }
      
      float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
        float NdotV = max(dot(N, V), 0.0);
        float NdotL = max(dot(N, L), 0.0);
        return GeometrySchlickGGX(NdotV, roughness) * GeometrySchlickGGX(NdotL, roughness);
      }
      
      vec3 fresnelSchlick(float cosTheta, vec3 F0) {
        return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
      }
      
      float calcShadow(vec4 lsPos) {
        if (!uShadowEnabled) return 0.0;
        vec3 projCoords = lsPos.xyz / lsPos.w;
        projCoords = projCoords * 0.5 + 0.5;
        if (projCoords.z > 1.0) return 0.0;
        float closestDepth = texture(uShadowMap, projCoords.xy).r;
        float currentDepth = projCoords.z;
        float bias = 0.005;
        
        float shadow = 0.0;
        vec2 texelSize = 1.0 / vec2(textureSize(uShadowMap, 0));
        for (int x = -1; x <= 1; x++) {
          for (int y = -1; y <= 1; y++) {
            float pcfDepth = texture(uShadowMap, projCoords.xy + vec2(x, y) * texelSize).r;
            shadow += currentDepth - bias > pcfDepth ? 1.0 : 0.0;
          }
        }
        return shadow / 9.0;
      }
      
      void main() {
        vec3 albedo = uBaseColor;
        if (uUseVertexColors) albedo *= vColor;
        if (uUseTexture) {
          vec4 texCol = texture(uTexture, vUV);
          albedo *= texCol.rgb;
        }
        
        vec3 N = normalize(vNormal);
        vec3 V = normalize(uCameraPos - vWorldPos);
        
        vec3 F0 = mix(vec3(0.04), albedo, uMetallic);
        
        vec3 Lo = vec3(0.0);
        
        for (int i = 0; i < MAX_LIGHTS; i++) {
          if (i >= uNumLights) break;
          
          vec3 L;
          float attenuation = 1.0;
          
          if (uLightTypes[i] == 0) {
            
            L = normalize(-uLightDirections[i]);
          } else {
            
            vec3 toLight = uLightPositions[i] - vWorldPos;
            float dist = length(toLight);
            L = normalize(toLight);
            attenuation = 1.0 / (1.0 + 0.09 * dist + 0.032 * dist * dist);
            
            if (uLightTypes[i] == 2) {
              
              float theta = dot(L, normalize(-uLightDirections[i]));
              float epsilon = uLightCutoffs[i] - uLightOuterCutoffs[i];
              float intensity = clamp((theta - uLightOuterCutoffs[i]) / epsilon, 0.0, 1.0);
              attenuation *= intensity;
            }
          }
          
          vec3 H = normalize(V + L);
          vec3 radiance = uLightColors[i] * uLightIntensities[i] * attenuation;
          
          float NDF = DistributionGGX(N, H, uRoughness);
          float G = GeometrySmith(N, V, L, uRoughness);
          vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
          
          vec3 numerator = NDF * G * F;
          float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
          vec3 specular = numerator / denominator;
          
          vec3 kD = (vec3(1.0) - F) * (1.0 - uMetallic);
          float NdotL = max(dot(N, L), 0.0);
          Lo += (kD * albedo / PI + specular) * radiance * NdotL;
        }
        
        vec3 ambient = uAmbientColor * uAmbientIntensity * albedo;
        float shadow = calcShadow(vLightSpacePos);
        vec3 color = ambient + (1.0 - shadow) * Lo + uEmissive;

        color = color / (color + vec3(1.0));
        
        color = pow(color, vec3(1.0 / 2.2));

        if (uFogEnabled) {
          float dist = length(uCameraPos - vWorldPos);
          float fogFactor = clamp((uFogFar - dist) / (uFogFar - uFogNear), 0.0, 1.0);
          color = mix(uFogColor, color, fogFactor);
        }
        
        fragColor = vec4(color, uOpacity);
      }
    `,

    shadowVert: `#version 300 es
      precision highp float;
      layout(location=0) in vec3 aPosition;
      uniform mat4 uModel;
      uniform mat4 uLightSpaceMatrix;
      void main() {
        gl_Position = uLightSpaceMatrix * uModel * vec4(aPosition, 1.0);
      }
    `,
    shadowFrag: `#version 300 es
      precision highp float;
      out vec4 fragColor;
      void main() {
        fragColor = vec4(vec3(gl_FragCoord.z), 1.0);
      }
    `,

    skyboxVert: `#version 300 es
      precision highp float;
      layout(location=0) in vec3 aPosition;
      uniform mat4 uView;
      uniform mat4 uProjection;
      out vec3 vTexCoord;
      void main() {
        vTexCoord = aPosition;
        mat4 viewNoTranslation = mat4(mat3(uView));
        vec4 pos = uProjection * viewNoTranslation * vec4(aPosition, 1.0);
        gl_Position = pos.xyww;
      }
    `,
    skyboxFrag: `#version 300 es
      precision highp float;
      in vec3 vTexCoord;
      uniform vec3 uSkyColorTop;
      uniform vec3 uSkyColorBottom;
      uniform vec3 uSkyColorHorizon;
      out vec4 fragColor;
      void main() {
        vec3 dir = normalize(vTexCoord);
        float t = dir.y * 0.5 + 0.5;
        vec3 color;
        if (t > 0.5) {
          color = mix(uSkyColorHorizon, uSkyColorTop, (t - 0.5) * 2.0);
        } else {
          color = mix(uSkyColorBottom, uSkyColorHorizon, t * 2.0);
        }
        fragColor = vec4(color, 1.0);
      }
    `,

    postVert: `#version 300 es
      precision highp float;
      layout(location=0) in vec2 aPosition;
      out vec2 vUV;
      void main() {
        vUV = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `,
    postFrag: `#version 300 es
      precision highp float;
      in vec2 vUV;
      uniform sampler2D uScreen;
      uniform bool uBloomEnabled;
      uniform float uBloomIntensity;
      uniform bool uVignetteEnabled;
      uniform float uVignetteIntensity;
      uniform bool uChromaticEnabled;
      uniform float uChromaticIntensity;
      uniform float uSaturation;
      uniform float uContrast;
      uniform float uBrightness;
      out vec4 fragColor;
      
      void main() {
        vec2 uv = vUV;
        vec3 color;
        
        if (uChromaticEnabled) {
          float offset = uChromaticIntensity * 0.01;
          color.r = texture(uScreen, uv + vec2(offset, 0.0)).r;
          color.g = texture(uScreen, uv).g;
          color.b = texture(uScreen, uv - vec2(offset, 0.0)).b;
        } else {
          color = texture(uScreen, uv).rgb;
        }

        if (uBloomEnabled) {
          vec3 bloom = vec3(0.0);
          float total = 0.0;
          for (int x = -4; x <= 4; x++) {
            for (int y = -4; y <= 4; y++) {
              vec2 off = vec2(float(x), float(y)) / vec2(textureSize(uScreen, 0));
              vec3 s = texture(uScreen, uv + off).rgb;
              float brightness = dot(s, vec3(0.2126, 0.7152, 0.0722));
              if (brightness > 0.7) {
                float w = 1.0 / (1.0 + float(x*x + y*y));
                bloom += s * w;
                total += w;
              }
            }
          }
          if (total > 0.0) bloom /= total;
          color += bloom * uBloomIntensity;
        }

        color *= uBrightness;
        color = (color - 0.5) * uContrast + 0.5;
        float grey = dot(color, vec3(0.2126, 0.7152, 0.0722));
        color = mix(vec3(grey), color, uSaturation);

        if (uVignetteEnabled) {
          float dist = distance(uv, vec2(0.5));
          float vig = smoothstep(0.8, 0.4, dist * uVignetteIntensity);
          color *= vig;
        }
        
        fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
      }
    `,

    particleVert: `#version 300 es
      precision highp float;
      layout(location=0) in vec3 aPosition;
      layout(location=1) in vec3 aOffset;
      layout(location=2) in vec4 aColor;
      layout(location=3) in float aSize;
      
      uniform mat4 uView;
      uniform mat4 uProjection;
      
      out vec4 vColor;
      
      void main() {
        vColor = aColor;
        vec4 viewPos = uView * vec4(aOffset, 1.0);
        viewPos.xyz += aPosition * aSize;
        gl_Position = uProjection * viewPos;
      }
    `,
    particleFrag: `#version 300 es
      precision highp float;
      in vec4 vColor;
      out vec4 fragColor;
      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.3, dist);
        fragColor = vec4(vColor.rgb, vColor.a * alpha);
      }
    `,
  };

  const Geometry = {
    createCube(sx = 1, sy = 1, sz = 1) {
      const p = [
        
        -0.5, -0.5, 0.5,  0.5, -0.5, 0.5,  0.5, 0.5, 0.5,  -0.5, 0.5, 0.5,
        
        0.5, -0.5, -0.5,  -0.5, -0.5, -0.5,  -0.5, 0.5, -0.5,  0.5, 0.5, -0.5,
        
        -0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5, -0.5,  -0.5, 0.5, -0.5,
        
        -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5, -0.5, 0.5,  -0.5, -0.5, 0.5,
        
        0.5, -0.5, 0.5,  0.5, -0.5, -0.5,  0.5, 0.5, -0.5,  0.5, 0.5, 0.5,
        
        -0.5, -0.5, -0.5,  -0.5, -0.5, 0.5,  -0.5, 0.5, 0.5,  -0.5, 0.5, -0.5,
      ];
      const n = [
        0,0,1, 0,0,1, 0,0,1, 0,0,1,
        0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
        0,1,0, 0,1,0, 0,1,0, 0,1,0,
        0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
        1,0,0, 1,0,0, 1,0,0, 1,0,0,
        -1,0,0, -1,0,0, -1,0,0, -1,0,0,
      ];
      const uv = [];
      for (let i = 0; i < 6; i++) uv.push(0,0, 1,0, 1,1, 0,1);
      const idx = [];
      for (let i = 0; i < 6; i++) {
        const o = i * 4;
        idx.push(o, o+1, o+2, o, o+2, o+3);
      }
      
      for (let i = 0; i < p.length; i += 3) {
        p[i] *= sx; p[i+1] *= sy; p[i+2] *= sz;
      }
      return {
        positions: new Float32Array(p),
        normals: new Float32Array(n),
        uvs: new Float32Array(uv),
        indices: new Uint16Array(idx),
      };
    },

    createSphere(radius = 0.5, segments = 32, rings = 16) {
      const positions = [], normals = [], uvs = [], indices = [];
      for (let y = 0; y <= rings; y++) {
        const v = y / rings;
        const phi = v * Math.PI;
        for (let x = 0; x <= segments; x++) {
          const u = x / segments;
          const theta = u * Math.PI * 2;
          const nx = Math.sin(phi) * Math.cos(theta);
          const ny = Math.cos(phi);
          const nz = Math.sin(phi) * Math.sin(theta);
          positions.push(nx * radius, ny * radius, nz * radius);
          normals.push(nx, ny, nz);
          uvs.push(u, v);
        }
      }
      for (let y = 0; y < rings; y++) {
        for (let x = 0; x < segments; x++) {
          const a = y * (segments + 1) + x;
          const b = a + segments + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        uvs: new Float32Array(uvs),
        indices: new Uint16Array(indices),
      };
    },

    createPlane(width = 10, height = 10, segW = 1, segH = 1) {
      const positions = [], normals = [], uvs = [], indices = [];
      const hw = width / 2, hh = height / 2;
      for (let y = 0; y <= segH; y++) {
        for (let x = 0; x <= segW; x++) {
          const u = x / segW, v = y / segH;
          positions.push(u * width - hw, 0, v * height - hh);
          normals.push(0, 1, 0);
          uvs.push(u, v);
        }
      }
      for (let y = 0; y < segH; y++) {
        for (let x = 0; x < segW; x++) {
          const a = y * (segW + 1) + x;
          const b = a + segW + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        uvs: new Float32Array(uvs),
        indices: new Uint16Array(indices),
      };
    },

    createCylinder(radiusTop = 0.5, radiusBottom = 0.5, height = 1, segments = 32) {
      const positions = [], normals = [], uvs = [], indices = [];
      const halfH = height / 2;
      
      for (let i = 0; i <= segments; i++) {
        const u = i / segments;
        const theta = u * Math.PI * 2;
        const cos = Math.cos(theta), sin = Math.sin(theta);
        
        positions.push(cos * radiusTop, halfH, sin * radiusTop);
        
        positions.push(cos * radiusBottom, -halfH, sin * radiusBottom);
        const slope = (radiusBottom - radiusTop) / height;
        const nx = cos, nz = sin, ny = slope;
        const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
        normals.push(nx/len, ny/len, nz/len);
        normals.push(nx/len, ny/len, nz/len);
        uvs.push(u, 0, u, 1);
      }
      for (let i = 0; i < segments; i++) {
        const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
        indices.push(a, b, c, b, d, c);
      }
      
      const addCap = (y, radius, up) => {
        const centerIdx = positions.length / 3;
        positions.push(0, y, 0);
        normals.push(0, up ? 1 : -1, 0);
        uvs.push(0.5, 0.5);
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const cos = Math.cos(theta), sin = Math.sin(theta);
          positions.push(cos * radius, y, sin * radius);
          normals.push(0, up ? 1 : -1, 0);
          uvs.push(cos * 0.5 + 0.5, sin * 0.5 + 0.5);
        }
        for (let i = 0; i < segments; i++) {
          if (up) {
            indices.push(centerIdx, centerIdx + 1 + i, centerIdx + 2 + i);
          } else {
            indices.push(centerIdx, centerIdx + 2 + i, centerIdx + 1 + i);
          }
        }
      };
      addCap(halfH, radiusTop, true);
      addCap(-halfH, radiusBottom, false);
      return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        uvs: new Float32Array(uvs),
        indices: new Uint16Array(indices),
      };
    },

    createCone(radius = 0.5, height = 1, segments = 32) {
      return Geometry.createCylinder(0, radius, height, segments);
    },

    createTorus(majorRadius = 0.5, minorRadius = 0.15, majorSeg = 32, minorSeg = 16) {
      const positions = [], normals = [], uvs = [], indices = [];
      for (let i = 0; i <= majorSeg; i++) {
        const u = i / majorSeg;
        const theta = u * Math.PI * 2;
        const cosT = Math.cos(theta), sinT = Math.sin(theta);
        for (let j = 0; j <= minorSeg; j++) {
          const v = j / minorSeg;
          const phi = v * Math.PI * 2;
          const cosP = Math.cos(phi), sinP = Math.sin(phi);
          const x = (majorRadius + minorRadius * cosP) * cosT;
          const y = minorRadius * sinP;
          const z = (majorRadius + minorRadius * cosP) * sinT;
          positions.push(x, y, z);
          const nx = cosP * cosT, ny = sinP, nz = cosP * sinT;
          normals.push(nx, ny, nz);
          uvs.push(u, v);
        }
      }
      for (let i = 0; i < majorSeg; i++) {
        for (let j = 0; j < minorSeg; j++) {
          const a = i * (minorSeg + 1) + j;
          const b = a + minorSeg + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        uvs: new Float32Array(uvs),
        indices: new Uint16Array(indices),
      };
    },

    createTerrain(width, depth, segW, segD, heightFunc) {
      const positions = [], normals = [], uvs = [], indices = [];
      for (let z = 0; z <= segD; z++) {
        for (let x = 0; x <= segW; x++) {
          const u = x / segW, v = z / segD;
          const px = (u - 0.5) * width;
          const pz = (v - 0.5) * depth;
          const py = heightFunc ? heightFunc(u, v) : 0;
          positions.push(px, py, pz);
          normals.push(0, 1, 0);
          uvs.push(u, v);
        }
      }
      for (let z = 0; z < segD; z++) {
        for (let x = 0; x < segW; x++) {
          const a = z * (segW + 1) + x;
          const b = a + segW + 1;
          indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
      }
      
      const pos = positions;
      const nrm = new Array(normals.length).fill(0);
      for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i], i1 = indices[i+1], i2 = indices[i+2];
        const v0 = new Vec3(pos[i0*3], pos[i0*3+1], pos[i0*3+2]);
        const v1 = new Vec3(pos[i1*3], pos[i1*3+1], pos[i1*3+2]);
        const v2 = new Vec3(pos[i2*3], pos[i2*3+1], pos[i2*3+2]);
        const n = v1.sub(v0).cross(v2.sub(v0));
        for (const idx of [i0, i1, i2]) {
          nrm[idx*3] += n.x; nrm[idx*3+1] += n.y; nrm[idx*3+2] += n.z;
        }
      }
      for (let i = 0; i < nrm.length; i += 3) {
        const l = Math.sqrt(nrm[i]*nrm[i] + nrm[i+1]*nrm[i+1] + nrm[i+2]*nrm[i+2]) || 1;
        nrm[i] /= l; nrm[i+1] /= l; nrm[i+2] /= l;
      }
      return {
        positions: new Float32Array(positions),
        normals: new Float32Array(nrm),
        uvs: new Float32Array(uvs),
        indices: new Uint16Array(indices),
      };
    },

    parseOBJ(text) {
      const verts = [], norms = [], texs = [];
      const positions = [], normals = [], uvs = [], indices = [];
      const vertMap = new Map();
      let indexCount = 0;

      const lines = text.split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        switch (parts[0]) {
          case "v":
            verts.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            break;
          case "vn":
            norms.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
            break;
          case "vt":
            texs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
            break;
          case "f":
            const face = [];
            for (let i = 1; i < parts.length; i++) {
              const key = parts[i];
              if (vertMap.has(key)) {
                face.push(vertMap.get(key));
              } else {
                const ids = key.split("/");
                const vi = parseInt(ids[0]) - 1;
                const ti = ids[1] ? parseInt(ids[1]) - 1 : -1;
                const ni = ids[2] ? parseInt(ids[2]) - 1 : -1;
                positions.push(...(verts[vi] || [0,0,0]));
                uvs.push(...(ti >= 0 && texs[ti] ? texs[ti] : [0,0]));
                normals.push(...(ni >= 0 && norms[ni] ? norms[ni] : [0,1,0]));
                vertMap.set(key, indexCount);
                face.push(indexCount);
                indexCount++;
              }
            }
            
            for (let i = 1; i < face.length - 1; i++) {
              indices.push(face[0], face[i], face[i+1]);
            }
            break;
        }
      }
      return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        uvs: new Float32Array(uvs),
        indices: new Uint16Array(indices),
      };
    },
  };

  class PhysicsBody {
    constructor(obj) {
      this.object = obj;
      this.velocity = new Vec3();
      this.acceleration = new Vec3();
      this.mass = 1;
      this.friction = 0.98;
      this.bounciness = 0.5;
      this.isStatic = false;
      this.useGravity = true;
      this.colliderType = "box"; 
      this.grounded = false;
    }
  }

  class PhysicsEngine {
    constructor() {
      this.bodies = [];
      this.gravity = new Vec3(0, -9.81, 0);
    }

    addBody(body) {
      this.bodies.push(body);
      return body;
    }

    removeBody(body) {
      const idx = this.bodies.indexOf(body);
      if (idx >= 0) this.bodies.splice(idx, 1);
    }

    update(dt) {
      dt = Math.min(dt, 0.05);
      for (const body of this.bodies) {
        if (body.isStatic) continue;

        if (body.useGravity) {
          body.velocity = body.velocity.add(this.gravity.scale(dt));
        }
        body.velocity = body.velocity.add(body.acceleration.scale(dt));
        body.velocity = body.velocity.scale(body.friction);

        const obj = body.object;
        obj.position = obj.position.add(body.velocity.scale(dt));
      }

      for (let i = 0; i < this.bodies.length; i++) {
        for (let j = i + 1; j < this.bodies.length; j++) {
          this._checkCollision(this.bodies[i], this.bodies[j]);
        }
      }
    }

    _getAABB(body) {
      const o = body.object;
      const s = o.scale;
      return {
        min: new Vec3(o.position.x - s.x/2, o.position.y - s.y/2, o.position.z - s.z/2),
        max: new Vec3(o.position.x + s.x/2, o.position.y + s.y/2, o.position.z + s.z/2),
      };
    }

    _checkCollision(a, b) {
      if (a.isStatic && b.isStatic) return;
      const aabb1 = this._getAABB(a);
      const aabb2 = this._getAABB(b);

      if (aabb1.max.x < aabb2.min.x || aabb1.min.x > aabb2.max.x) return;
      if (aabb1.max.y < aabb2.min.y || aabb1.min.y > aabb2.max.y) return;
      if (aabb1.max.z < aabb2.min.z || aabb1.min.z > aabb2.max.z) return;

      const overlapX = Math.min(aabb1.max.x - aabb2.min.x, aabb2.max.x - aabb1.min.x);
      const overlapY = Math.min(aabb1.max.y - aabb2.min.y, aabb2.max.y - aabb1.min.y);
      const overlapZ = Math.min(aabb1.max.z - aabb2.min.z, aabb2.max.z - aabb1.min.z);

      let axis, overlap;
      if (overlapX <= overlapY && overlapX <= overlapZ) {
        axis = "x"; overlap = overlapX;
      } else if (overlapY <= overlapZ) {
        axis = "y"; overlap = overlapY;
      } else {
        axis = "z"; overlap = overlapZ;
      }

      const sign = a.object.position[axis] < b.object.position[axis] ? -1 : 1;

      if (!a.isStatic) {
        a.object.position[axis] += sign * overlap * (b.isStatic ? 1 : 0.5);
        a.velocity[axis] *= -a.bounciness;
        if (axis === "y" && sign === -1) a.grounded = true;
      }
      if (!b.isStatic) {
        b.object.position[axis] -= sign * overlap * (a.isStatic ? 1 : 0.5);
        b.velocity[axis] *= -b.bounciness;
        if (axis === "y" && sign === 1) b.grounded = true;
      }

      a._lastCollision = b.object.id;
      b._lastCollision = a.object.id;
    }

    raycast(origin, direction, maxDist = 1000) {
      let closest = null;
      let closestDist = maxDist;
      const dir = direction.normalize();

      for (const body of this.bodies) {
        const aabb = this._getAABB(body);
        const t = this._rayAABB(origin, dir, aabb);
        if (t !== null && t < closestDist && t >= 0) {
          closestDist = t;
          closest = { body, distance: t, point: origin.add(dir.scale(t)) };
        }
      }
      return closest;
    }

    _rayAABB(origin, dir, aabb) {
      let tmin = -Infinity, tmax = Infinity;
      for (const axis of ["x", "y", "z"]) {
        if (Math.abs(dir[axis]) < 1e-8) {
          if (origin[axis] < aabb.min[axis] || origin[axis] > aabb.max[axis]) return null;
        } else {
          let t1 = (aabb.min[axis] - origin[axis]) / dir[axis];
          let t2 = (aabb.max[axis] - origin[axis]) / dir[axis];
          if (t1 > t2) [t1, t2] = [t2, t1];
          tmin = Math.max(tmin, t1);
          tmax = Math.min(tmax, t2);
          if (tmin > tmax) return null;
        }
      }
      return tmin;
    }
  }

  class ParticleSystem {
    constructor(maxParticles = 1000) {
      this.maxParticles = maxParticles;
      this.particles = [];
      this.position = new Vec3();
      this.emitRate = 50;
      this.lifetime = [1, 3];
      this.speed = [1, 5];
      this.size = [0.05, 0.2];
      this.color = [1, 1, 1];
      this.colorEnd = [1, 1, 1];
      this.gravity = new Vec3(0, -2, 0);
      this.spread = 1;
      this.active = true;
      this._emitAccum = 0;
    }

    update(dt) {
      if (this.active) {
        this._emitAccum += this.emitRate * dt;
        while (this._emitAccum >= 1 && this.particles.length < this.maxParticles) {
          this._emitAccum--;
          this._emit();
        }
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.age += dt;
        if (p.age >= p.lifetime) {
          this.particles.splice(i, 1);
          continue;
        }
        p.velocity = p.velocity.add(this.gravity.scale(dt));
        p.position = p.position.add(p.velocity.scale(dt));
        const t = p.age / p.lifetime;
        p.currentSize = MathUtils.lerp(p.startSize, 0, t);
        p.currentColor = [
          MathUtils.lerp(this.color[0], this.colorEnd[0], t),
          MathUtils.lerp(this.color[1], this.colorEnd[1], t),
          MathUtils.lerp(this.color[2], this.colorEnd[2], t),
          1 - t,
        ];
      }
    }

    _emit() {
      const dir = new Vec3(
        (Math.random() - 0.5) * this.spread,
        Math.random() * this.spread,
        (Math.random() - 0.5) * this.spread
      ).normalize();
      const speed = MathUtils.lerp(this.speed[0], this.speed[1], Math.random());
      this.particles.push({
        position: this.position.clone(),
        velocity: dir.scale(speed),
        age: 0,
        lifetime: MathUtils.lerp(this.lifetime[0], this.lifetime[1], Math.random()),
        startSize: MathUtils.lerp(this.size[0], this.size[1], Math.random()),
        currentSize: this.size[0],
        currentColor: [...this.color, 1],
      });
    }
  }

  class Object3D {
    constructor(id) {
      this.id = id;
      this.position = new Vec3();
      this.rotation = new Vec3();
      this.scale = new Vec3(1, 1, 1);
      this.color = [1, 1, 1];
      this.metallic = 0;
      this.roughness = 0.5;
      this.opacity = 1;
      this.emissive = [0, 0, 0];
      this.visible = true;
      this.castShadow = true;
      this.receiveShadow = true;
      this.geometry = null;
      this.textureId = null;
      this.parent = null;
      this.children = [];
      this._vao = null;
      this._indexCount = 0;
      this._dirty = true;
    }

    getModelMatrix() {
      const T = Mat4.translation(this.position.x, this.position.y, this.position.z);
      const RX = Mat4.rotationX(MathUtils.degToRad(this.rotation.x));
      const RY = Mat4.rotationY(MathUtils.degToRad(this.rotation.y));
      const RZ = Mat4.rotationZ(MathUtils.degToRad(this.rotation.z));
      const S = Mat4.scaling(this.scale.x, this.scale.y, this.scale.z);
      let m = Mat4.multiply(T, Mat4.multiply(RY, Mat4.multiply(RX, RZ)));
      m = Mat4.multiply(m, S);
      if (this.parent) {
        m = Mat4.multiply(this.parent.getModelMatrix(), m);
      }
      return m;
    }

    addChild(child) {
      child.parent = this;
      this.children.push(child);
    }

    lookAt(target) {
      const dir = target.sub(this.position).normalize();
      this.rotation.y = MathUtils.radToDeg(Math.atan2(dir.x, dir.z));
      this.rotation.x = MathUtils.radToDeg(-Math.asin(dir.y));
    }
  }

  class Light3D {
    constructor(id, type = "directional") {
      this.id = id;
      this.type = type; 
      this.position = new Vec3(0, 10, 0);
      this.direction = new Vec3(0, -1, -1);
      this.color = [1, 1, 1];
      this.intensity = 1;
      this.cutoff = Math.cos(MathUtils.degToRad(12.5));
      this.outerCutoff = Math.cos(MathUtils.degToRad(17.5));
      this.castShadow = false;
    }
  }

  class Camera3D {
    constructor() {
      this.position = new Vec3(0, 5, 10);
      this.target = new Vec3(0, 0, 0);
      this.up = new Vec3(0, 1, 0);
      this.fov = 60;
      this.near = 0.1;
      this.far = 1000;
      this.mode = "perspective"; 
      this.orthoSize = 10;
      
      this.yaw = -90;
      this.pitch = 0;
      this._fpsMode = false;
    }

    getViewMatrix() {
      if (this._fpsMode) {
        const front = this.getFront();
        this.target = this.position.add(front);
      }
      return Mat4.lookAt(this.position, this.target, this.up);
    }

    getProjectionMatrix(aspect) {
      if (this.mode === "orthographic") {
        const s = this.orthoSize;
        return Mat4.ortho(-s * aspect, s * aspect, -s, s, this.near, this.far);
      }
      return Mat4.perspective(MathUtils.degToRad(this.fov), aspect, this.near, this.far);
    }

    getFront() {
      const yawRad = MathUtils.degToRad(this.yaw);
      const pitchRad = MathUtils.degToRad(this.pitch);
      return new Vec3(
        Math.cos(pitchRad) * Math.cos(yawRad),
        Math.sin(pitchRad),
        Math.cos(pitchRad) * Math.sin(yawRad)
      ).normalize();
    }

    getRight() {
      return this.getFront().cross(this.up).normalize();
    }
  }

  class Ultra3DRenderer {
    constructor() {
      this.canvas = null;
      this.gl = null;
      this.objects = new Map();
      this.lights = new Map();
      this.camera = new Camera3D();
      this.physics = new PhysicsEngine();
      this.particleSystems = new Map();
      this.textures = new Map();

      this._mainProgram = null;
      this._shadowProgram = null;
      this._skyboxProgram = null;
      this._postProgram = null;

      this._shadowFBO = null;
      this._shadowTexture = null;
      this._sceneFBO = null;
      this._sceneTexture = null;
      this._sceneRBO = null;

      this._skyboxVAO = null;
      this.skyColorTop = [0.1, 0.3, 0.8];
      this.skyColorBottom = [0.8, 0.85, 0.9];
      this.skyColorHorizon = [0.5, 0.7, 0.95];
      this.skyEnabled = true;

      this.ambientColor = [0.15, 0.15, 0.2];
      this.ambientIntensity = 1.0;

      this.fogEnabled = false;
      this.fogColor = [0.7, 0.7, 0.7];
      this.fogNear = 20;
      this.fogFar = 100;

      this.bloomEnabled = false;
      this.bloomIntensity = 0.5;
      this.vignetteEnabled = false;
      this.vignetteIntensity = 1.5;
      this.chromaticEnabled = false;
      this.chromaticIntensity = 1.0;
      this.saturation = 1.0;
      this.contrast = 1.0;
      this.brightness = 1.0;

      this.shadowEnabled = false;
      this.shadowMapSize = 2048;

      this._initialized = false;
      this._lastTime = 0;
      this._animFrame = null;
      this._running = false;
      this._objectIdCounter = 0;
      this._lightIdCounter = 0;
      this._particleIdCounter = 0;

      this._keys = {};
      this._mouse = { x: 0, y: 0, dx: 0, dy: 0, locked: false };

      this._quadVAO = null;
    }

    init(width = 480, height = 360) {
      
      this.canvas = document.createElement("canvas");
      this.canvas.width = width;
      this.canvas.height = height;
      this.canvas.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        z-index: 50;
        image-rendering: pixelated;
        cursor: crosshair;
      `;

      const stageEl =
        document.querySelector('[class*="stage_stage"]') ||
        document.querySelector("canvas") ?.parentElement ||
        document.body;
      stageEl.style.position = "relative";
      stageEl.appendChild(this.canvas);

      this.gl = this.canvas.getContext("webgl2", {
        alpha: false,
        antialias: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance",
      });

      if (!this.gl) {
        console.error("WebGL2 not supported!");
        return false;
      }

      const gl = this.gl;
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      this._mainProgram = this._createProgram(SHADERS.mainVert, SHADERS.mainFrag);
      this._shadowProgram = this._createProgram(SHADERS.shadowVert, SHADERS.shadowFrag);
      this._skyboxProgram = this._createProgram(SHADERS.skyboxVert, SHADERS.skyboxFrag);
      this._postProgram = this._createProgram(SHADERS.postVert, SHADERS.postFrag);

      this._initShadowMap();

      this._initSceneFBO();

      this._initSkybox();

      this._initQuad();

      this._initInput();

      this._initialized = true;
      return true;
    }

    _createShader(type, source) {
      const gl = this.gl;
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    _createProgram(vertSrc, fragSrc) {
      const gl = this.gl;
      const vs = this._createShader(gl.VERTEX_SHADER, vertSrc);
      const fs = this._createShader(gl.FRAGMENT_SHADER, fragSrc);
      if (!vs || !fs) return null;
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        return null;
      }
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return program;
    }

    _initShadowMap() {
      const gl = this.gl;
      const size = this.shadowMapSize;
      this._shadowTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this._shadowTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, size, size, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      this._shadowFBO = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFBO);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._shadowTexture, 0);
      gl.drawBuffers([gl.NONE]);
      gl.readBuffer(gl.NONE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    _initSceneFBO() {
      const gl = this.gl;
      const w = this.canvas.width, h = this.canvas.height;

      this._sceneTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this._sceneTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      this._sceneRBO = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, this._sceneRBO);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, w, h);

      this._sceneFBO = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._sceneFBO);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._sceneTexture, 0);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this._sceneRBO);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    _initSkybox() {
      const gl = this.gl;
      const verts = new Float32Array([
        -1,1,-1, -1,-1,-1, 1,-1,-1, 1,-1,-1, 1,1,-1, -1,1,-1,
        -1,-1,1, -1,-1,-1, -1,1,-1, -1,1,-1, -1,1,1, -1,-1,1,
        1,-1,-1, 1,-1,1, 1,1,1, 1,1,1, 1,1,-1, 1,-1,-1,
        -1,-1,1, -1,1,1, 1,1,1, 1,1,1, 1,-1,1, -1,-1,1,
        -1,1,-1, 1,1,-1, 1,1,1, 1,1,1, -1,1,1, -1,1,-1,
        -1,-1,-1, -1,-1,1, 1,-1,1, 1,-1,1, 1,-1,-1, -1,-1,-1,
      ]);
      this._skyboxVAO = gl.createVertexArray();
      gl.bindVertexArray(this._skyboxVAO);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
    }

    _initQuad() {
      const gl = this.gl;
      const verts = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
      this._quadVAO = gl.createVertexArray();
      gl.bindVertexArray(this._quadVAO);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
    }

    _initInput() {
      document.addEventListener("keydown", (e) => { this._keys[e.code] = true; });
      document.addEventListener("keyup", (e) => { this._keys[e.code] = false; });
      this.canvas.addEventListener("mousemove", (e) => {
        if (this._mouse.locked) {
          this._mouse.dx += e.movementX;
          this._mouse.dy += e.movementY;
        }
        this._mouse.x = e.offsetX;
        this._mouse.y = e.offsetY;
      });
      this.canvas.addEventListener("click", () => {
        if (this.camera._fpsMode) {
          this.canvas.requestPointerLock();
        }
      });
      document.addEventListener("pointerlockchange", () => {
        this._mouse.locked = document.pointerLockElement === this.canvas;
      });
    }

    _uploadGeometry(obj) {
      if (!obj.geometry || !obj._dirty) return;
      const gl = this.gl;
      const g = obj.geometry;

      if (obj._vao) gl.deleteVertexArray(obj._vao);
      obj._vao = gl.createVertexArray();
      gl.bindVertexArray(obj._vao);

      const posBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, g.positions, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

      const normBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
      gl.bufferData(gl.ARRAY_BUFFER, g.normals, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

      const uvBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
      gl.bufferData(gl.ARRAY_BUFFER, g.uvs, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(2);
      gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);

      const colors = new Float32Array(g.positions.length).fill(1);
      const colBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
      gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(3);
      gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 0, 0);

      const idxBuf = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.indices, gl.STATIC_DRAW);

      obj._indexCount = g.indices.length;
      obj._dirty = false;
      gl.bindVertexArray(null);
    }

    loadTexture(id, url) {
      return new Promise((resolve) => {
        const gl = this.gl;
        const tex = gl.createTexture();
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
          this.textures.set(id, tex);
          resolve(true);
        };
        img.onerror = () => resolve(false);
        img.src = url;
      });
    }

    render() {
      if (!this._initialized) return;
      const gl = this.gl;
      const aspect = this.canvas.width / this.canvas.height;

      const viewMatrix = this.camera.getViewMatrix();
      const projMatrix = this.camera.getProjectionMatrix(aspect);

      let lightSpaceMatrix = Mat4.identity();
      if (this.shadowEnabled) {
        this._renderShadowPass(lightSpaceMatrix);
        
        for (const [, light] of this.lights) {
          if (light.type === "directional" && light.castShadow) {
            const lightDir = light.direction.normalize();
            const lightPos = lightDir.scale(-50);
            const lightView = Mat4.lookAt(lightPos, new Vec3(0,0,0), new Vec3(0,1,0));
            const lightProj = Mat4.ortho(-30, 30, -30, 30, 0.1, 100);
            lightSpaceMatrix = Mat4.multiply(lightProj, lightView);
            break;
          }
        }
        this._renderShadowPass(lightSpaceMatrix);
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, this._sceneFBO);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      if (this.skyEnabled) {
        this._renderSkybox(viewMatrix, projMatrix);
      }

      gl.useProgram(this._mainProgram);
      this._setMainUniforms(viewMatrix, projMatrix, lightSpaceMatrix);

      for (const [, obj] of this.objects) {
        if (!obj.visible) continue;
        this._uploadGeometry(obj);
        if (!obj._vao) continue;

        const model = obj.getModelMatrix();
        const normalMatrix = Mat4.transpose(Mat4.inverse(model));

        gl.uniformMatrix4fv(gl.getUniformLocation(this._mainProgram, "uModel"), false, model);
        gl.uniformMatrix4fv(gl.getUniformLocation(this._mainProgram, "uNormalMatrix"), false, normalMatrix);
        gl.uniform3fv(gl.getUniformLocation(this._mainProgram, "uBaseColor"), obj.color);
        gl.uniform1f(gl.getUniformLocation(this._mainProgram, "uMetallic"), obj.metallic);
        gl.uniform1f(gl.getUniformLocation(this._mainProgram, "uRoughness"), obj.roughness);
        gl.uniform1f(gl.getUniformLocation(this._mainProgram, "uOpacity"), obj.opacity);
        gl.uniform3fv(gl.getUniformLocation(this._mainProgram, "uEmissive"), obj.emissive);
        gl.uniform1i(gl.getUniformLocation(this._mainProgram, "uUseVertexColors"), 0);

        if (obj.textureId && this.textures.has(obj.textureId)) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, this.textures.get(obj.textureId));
          gl.uniform1i(gl.getUniformLocation(this._mainProgram, "uTexture"), 0);
          gl.uniform1i(gl.getUniformLocation(this._mainProgram, "uUseTexture"), 1);
        } else {
          gl.uniform1i(gl.getUniformLocation(this._mainProgram, "uUseTexture"), 0);
        }

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this._shadowTexture);
        gl.uniform1i(gl.getUniformLocation(this._mainProgram, "uShadowMap"), 1);

        if (obj.opacity < 1) {
          gl.disable(gl.CULL_FACE);
        }

        gl.bindVertexArray(obj._vao);
        gl.drawElements(gl.TRIANGLES, obj._indexCount, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);

        if (obj.opacity < 1) {
          gl.enable(gl.CULL_FACE);
        }
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.DEPTH_TEST);

      gl.useProgram(this._postProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this._sceneTexture);
      gl.uniform1i(gl.getUniformLocation(this._postProgram, "uScreen"), 0);
      gl.uniform1i(gl.getUniformLocation(this._postProgram, "uBloomEnabled"), this.bloomEnabled);
      gl.uniform1f(gl.getUniformLocation(this._postProgram, "uBloomIntensity"), this.bloomIntensity);
      gl.uniform1i(gl.getUniformLocation(this._postProgram, "uVignetteEnabled"), this.vignetteEnabled);
      gl.uniform1f(gl.getUniformLocation(this._postProgram, "uVignetteIntensity"), this.vignetteIntensity);
      gl.uniform1i(gl.getUniformLocation(this._postProgram, "uChromaticEnabled"), this.chromaticEnabled);
      gl.uniform1f(gl.getUniformLocation(this._postProgram, "uChromaticIntensity"), this.chromaticIntensity);
      gl.uniform1f(gl.getUniformLocation(this._postProgram, "uSaturation"), this.saturation);
      gl.uniform1f(gl.getUniformLocation(this._postProgram, "uContrast"), this.contrast);
      gl.uniform1f(gl.getUniformLocation(this._postProgram, "uBrightness"), this.brightness);

      gl.bindVertexArray(this._quadVAO);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindVertexArray(null);

      gl.enable(gl.DEPTH_TEST);
    }

    _renderShadowPass(lightSpaceMatrix) {
      const gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFBO);
      gl.viewport(0, 0, this.shadowMapSize, this.shadowMapSize);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.useProgram(this._shadowProgram);
      gl.uniformMatrix4fv(gl.getUniformLocation(this._shadowProgram, "uLightSpaceMatrix"), false, lightSpaceMatrix);

      for (const [, obj] of this.objects) {
        if (!obj.visible || !obj.castShadow) continue;
        this._uploadGeometry(obj);
        if (!obj._vao) continue;
        gl.uniformMatrix4fv(gl.getUniformLocation(this._shadowProgram, "uModel"), false, obj.getModelMatrix());
        gl.bindVertexArray(obj._vao);
        gl.drawElements(gl.TRIANGLES, obj._indexCount, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    _renderSkybox(viewMatrix, projMatrix) {
      const gl = this.gl;
      gl.depthFunc(gl.LEQUAL);
      gl.useProgram(this._skyboxProgram);
      gl.uniformMatrix4fv(gl.getUniformLocation(this._skyboxProgram, "uView"), false, viewMatrix);
      gl.uniformMatrix4fv(gl.getUniformLocation(this._skyboxProgram, "uProjection"), false, projMatrix);
      gl.uniform3fv(gl.getUniformLocation(this._skyboxProgram, "uSkyColorTop"), this.skyColorTop);
      gl.uniform3fv(gl.getUniformLocation(this._skyboxProgram, "uSkyColorBottom"), this.skyColorBottom);
      gl.uniform3fv(gl.getUniformLocation(this._skyboxProgram, "uSkyColorHorizon"), this.skyColorHorizon);
      gl.bindVertexArray(this._skyboxVAO);
      gl.drawArrays(gl.TRIANGLES, 0, 36);
      gl.bindVertexArray(null);
      gl.depthFunc(gl.LESS);
    }

    _setMainUniforms(viewMatrix, projMatrix, lightSpaceMatrix) {
      const gl = this.gl;
      const p = this._mainProgram;
      gl.uniformMatrix4fv(gl.getUniformLocation(p, "uView"), false, viewMatrix);
      gl.uniformMatrix4fv(gl.getUniformLocation(p, "uProjection"), false, projMatrix);
      gl.uniformMatrix4fv(gl.getUniformLocation(p, "uLightSpaceMatrix"), false, lightSpaceMatrix);
      gl.uniform3fv(gl.getUniformLocation(p, "uCameraPos"), this.camera.position.toArray());
      gl.uniform3fv(gl.getUniformLocation(p, "uAmbientColor"), this.ambientColor);
      gl.uniform1f(gl.getUniformLocation(p, "uAmbientIntensity"), this.ambientIntensity);
      gl.uniform1i(gl.getUniformLocation(p, "uFogEnabled"), this.fogEnabled);
      gl.uniform3fv(gl.getUniformLocation(p, "uFogColor"), this.fogColor);
      gl.uniform1f(gl.getUniformLocation(p, "uFogNear"), this.fogNear);
      gl.uniform1f(gl.getUniformLocation(p, "uFogFar"), this.fogFar);
      gl.uniform1i(gl.getUniformLocation(p, "uShadowEnabled"), this.shadowEnabled);

      const lightArr = [...this.lights.values()];
      gl.uniform1i(gl.getUniformLocation(p, "uNumLights"), lightArr.length);
      for (let i = 0; i < Math.min(lightArr.length, 16); i++) {
        const l = lightArr[i];
        gl.uniform3fv(gl.getUniformLocation(p, `uLightPositions[${i}]`), l.position.toArray());
        gl.uniform3fv(gl.getUniformLocation(p, `uLightColors[${i}]`), l.color);
        gl.uniform1f(gl.getUniformLocation(p, `uLightIntensities[${i}]`), l.intensity);
        gl.uniform1i(gl.getUniformLocation(p, `uLightTypes[${i}]`), l.type === "directional" ? 0 : l.type === "point" ? 1 : 2);
        gl.uniform3fv(gl.getUniformLocation(p, `uLightDirections[${i}]`), l.direction.toArray());
        gl.uniform1f(gl.getUniformLocation(p, `uLightCutoffs[${i}]`), l.cutoff);
        gl.uniform1f(gl.getUniformLocation(p, `uLightOuterCutoffs[${i}]`), l.outerCutoff);
      }
    }

    updateFPSCamera(sensitivity = 0.1, speed = 0.15) {
      const cam = this.camera;
      if (!cam._fpsMode) return;

      cam.yaw += this._mouse.dx * sensitivity;
      cam.pitch -= this._mouse.dy * sensitivity;
      cam.pitch = MathUtils.clamp(cam.pitch, -89, 89);
      this._mouse.dx = 0;
      this._mouse.dy = 0;

      const front = cam.getFront();
      const right = cam.getRight();
      if (this._keys["KeyW"]) cam.position = cam.position.add(front.scale(speed));
      if (this._keys["KeyS"]) cam.position = cam.position.sub(front.scale(speed));
      if (this._keys["KeyA"]) cam.position = cam.position.sub(right.scale(speed));
      if (this._keys["KeyD"]) cam.position = cam.position.add(right.scale(speed));
      if (this._keys["Space"]) cam.position.y += speed;
      if (this._keys["ShiftLeft"]) cam.position.y -= speed;
    }

    destroy() {
      this._running = false;
      if (this._animFrame) cancelAnimationFrame(this._animFrame);
      if (this.canvas && this.canvas.parentElement) {
        this.canvas.parentElement.removeChild(this.canvas);
      }
      this.objects.clear();
      this.lights.clear();
      this.particleSystems.clear();
      this._initialized = false;
    }
  }

  const renderer = new Ultra3DRenderer();

  function hexToRGB(hex) {
    hex = String(hex).replace("#", "");
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const num = parseInt(hex, 16);
    return [(num >> 16 & 255) / 255, (num >> 8 & 255) / 255, (num & 255) / 255];
  }

  class Ultra3DExtension {
    getInfo() {
      return {
        id: "ultra3d",
        name: "🎮 Ultra3D Engine",
        color1: "#1a1a2e",
        color2: "#16213e",
        color3: "#0f3460",
        blocks: [
          
          {
            blockType: Scratch.BlockType.LABEL,
            text: "🚀 Инициализация",
          },
          {
            opcode: "initEngine",
            blockType: Scratch.BlockType.COMMAND,
            text: "🚀 Инициализировать 3D движок [W] x [H]",
            arguments: {
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 480 },
              H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 360 },
            },
          },
          {
            opcode: "destroyEngine",
            blockType: Scratch.BlockType.COMMAND,
            text: "💥 Уничтожить 3D движок",
          },
          {
            opcode: "renderScene",
            blockType: Scratch.BlockType.COMMAND,
            text: "🖼️ Отрисовать сцену",
          },
          {
            opcode: "updatePhysics",
            blockType: Scratch.BlockType.COMMAND,
            text: "⚡ Обновить физику dt [DT]",
            arguments: {
              DT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.016 },
            },
          },
          {
            opcode: "isInitialized",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "движок инициализирован?",
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: "📦 3D Объекты",
          },
          {
            opcode: "createPrimitive",
            blockType: Scratch.BlockType.REPORTER,
            text: "➕ Создать [SHAPE] с именем [NAME]",
            arguments: {
              SHAPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "shapeMenu",
                defaultValue: "cube",
              },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
            },
          },
          {
            opcode: "createSizedBox",
            blockType: Scratch.BlockType.REPORTER,
            text: "➕ Создать куб [NAME] размер [SX]x[SY]x[SZ]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "box1" },
              SX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              SY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              SZ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "createTerrain",
            blockType: Scratch.BlockType.REPORTER,
            text: "🏔️ Создать террейн [NAME] размер [W]x[D] сегменты [S] высота [H]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "terrain" },
              W: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              D: { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
              S: { type: Scratch.ArgumentType.NUMBER, defaultValue: 32 },
              H: { type: Scratch.ArgumentType.NUMBER, defaultValue: 3 },
            },
          },
          {
            opcode: "loadOBJ",
            blockType: Scratch.BlockType.REPORTER,
            text: "📥 Загрузить OBJ модель [NAME] из [URL]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "model" },
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: "https:
            },
          },
          {
            opcode: "deleteObject",
            blockType: Scratch.BlockType.COMMAND,
            text: "🗑️ Удалить объект [NAME]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
            },
          },
          {
            opcode: "deleteAllObjects",
            blockType: Scratch.BlockType.COMMAND,
            text: "🗑️ Удалить все объекты",
          },
          {
            opcode: "cloneObject",
            blockType: Scratch.BlockType.REPORTER,
            text: "📋 Клонировать [NAME] как [NEW_NAME]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              NEW_NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "clone1" },
            },
          },
          {
            opcode: "objectExists",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "объект [NAME] существует?",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
            },
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: "🔄 Трансформации",
          },
          {
            opcode: "setPosition",
            blockType: Scratch.BlockType.COMMAND,
            text: "📍 [NAME] позиция x:[X] y:[Y] z:[Z]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "moveBy",
            blockType: Scratch.BlockType.COMMAND,
            text: "🏃 [NAME] сдвинуть на x:[X] y:[Y] z:[Z]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "setRotation",
            blockType: Scratch.BlockType.COMMAND,
            text: "🔄 [NAME] вращение x:[X] y:[Y] z:[Z]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "rotateBy",
            blockType: Scratch.BlockType.COMMAND,
            text: "🔄 [NAME] повернуть на x:[X] y:[Y] z:[Z]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "setScale",
            blockType: Scratch.BlockType.COMMAND,
            text: "📐 [NAME] масштаб x:[X] y:[Y] z:[Z]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "setScaleUniform",
            blockType: Scratch.BlockType.COMMAND,
            text: "📐 [NAME] масштаб [S]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              S: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "lookAtTarget",
            blockType: Scratch.BlockType.COMMAND,
            text: "👁️ [NAME] смотреть на x:[X] y:[Y] z:[Z]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "getObjectProp",
            blockType: Scratch.BlockType.REPORTER,
            text: "📊 [NAME] [PROP]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              PROP: {
                type: Scratch.ArgumentType.STRING,
                menu: "objPropMenu",
                defaultValue: "x",
              },
            },
          },
          {
            opcode: "setVisible",
            blockType: Scratch.BlockType.COMMAND,
            text: "👁️ [NAME] видимость [VIS]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              VIS: {
                type: Scratch.ArgumentType.STRING,
                menu: "visMenu",
                defaultValue: "показать",
              },
            },
          },
          {
            opcode: "distanceBetween",
            blockType: Scratch.BlockType.REPORTER,
            text: "📏 расстояние между [A] и [B]",
            arguments: {
              A: { type: Scratch.ArgumentType.STRING, defaultValue: "obj1" },
              B: { type: Scratch.ArgumentType.STRING, defaultValue: "obj2" },
            },
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: "🎨 Материалы",
          },
          {
            opcode: "setColor",
            blockType: Scratch.BlockType.COMMAND,
            text: "🎨 [NAME] цвет [COLOR]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: "#ff4444" },
            },
          },
          {
            opcode: "setColorRGB",
            blockType: Scratch.BlockType.COMMAND,
            text: "🎨 [NAME] цвет R:[R] G:[G] B:[B]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              R: { type: Scratch.ArgumentType.NUMBER, defaultValue: 255 },
              G: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
              B: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
            },
          },
          {
            opcode: "setMaterial",
            blockType: Scratch.BlockType.COMMAND,
            text: "✨ [NAME] металличность [M] шероховатость [R]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              M: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              R: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.5 },
            },
          },
          {
            opcode: "setOpacity",
            blockType: Scratch.BlockType.COMMAND,
            text: "🌫️ [NAME] прозрачность [O]%",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              O: { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
            },
          },
          {
            opcode: "setEmissive",
            blockType: Scratch.BlockType.COMMAND,
            text: "💡 [NAME] свечение [COLOR] сила [I]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: "#000000" },
              I: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "setTexture",
            blockType: Scratch.BlockType.COMMAND,
            text: "🖼️ [NAME] текстура [TEX_ID]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              TEX_ID: { type: Scratch.ArgumentType.STRING, defaultValue: "tex1" },
            },
          },
          {
            opcode: "loadTextureFromURL",
            blockType: Scratch.BlockType.COMMAND,
            text: "📥 Загрузить текстуру [ID] из [URL]",
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: "tex1" },
              URL: { type: Scratch.ArgumentType.STRING, defaultValue: "https:
            },
          },
          {
            opcode: "setPresetMaterial",
            blockType: Scratch.BlockType.COMMAND,
            text: "🎭 [NAME] пресет материала [PRESET]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              PRESET: {
                type: Scratch.ArgumentType.STRING,
                menu: "materialPresetMenu",
                defaultValue: "metal",
              },
            },
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: "📷 Камера",
          },
          {
            opcode: "setCameraPos",
            blockType: Scratch.BlockType.COMMAND,
            text: "📷 Камера позиция x:[X] y:[Y] z:[Z]",
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
            },
          },
          {
            opcode: "setCameraTarget",
            blockType: Scratch.BlockType.COMMAND,
            text: "🎯 Камера смотреть на x:[X] y:[Y] z:[Z]",
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "setCameraLookAtObject",
            blockType: Scratch.BlockType.COMMAND,
            text: "🎯 Камера смотреть на объект [NAME]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
            },
          },
          {
            opcode: "setCameraFOV",
            blockType: Scratch.BlockType.COMMAND,
            text: "🔭 Камера FOV [FOV]°",
            arguments: {
              FOV: { type: Scratch.ArgumentType.NUMBER, defaultValue: 60 },
            },
          },
          {
            opcode: "setCameraMode",
            blockType: Scratch.BlockType.COMMAND,
            text: "📷 Режим камеры [MODE]",
            arguments: {
              MODE: {
                type: Scratch.ArgumentType.STRING,
                menu: "cameraModeMenu",
                defaultValue: "perspective",
              },
            },
          },
          {
            opcode: "enableFPSCamera",
            blockType: Scratch.BlockType.COMMAND,
            text: "🎮 Режим от первого лица [STATE]",
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: "onOffMenu",
                defaultValue: "вкл",
              },
            },
          },
          {
            opcode: "updateFPSControls",
            blockType: Scratch.BlockType.COMMAND,
            text: "🎮 Обновить FPS управление скорость [S] чувствительность [SENS]",
            arguments: {
              S: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.15 },
              SENS: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.1 },
            },
          },
          {
            opcode: "followObject",
            blockType: Scratch.BlockType.COMMAND,
            text: "📷 Камера следовать за [NAME] смещение x:[OX] y:[OY] z:[OZ]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "player" },
              OX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              OY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              OZ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
            },
          },
          {
            opcode: "getCameraProp",
            blockType: Scratch.BlockType.REPORTER,
            text: "📷 Камера [PROP]",
            arguments: {
              PROP: {
                type: Scratch.ArgumentType.STRING,
                menu: "camPropMenu",
                defaultValue: "x",
              },
            },
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: "💡 Освещение",
          },
          {
            opcode: "addLight",
            blockType: Scratch.BlockType.REPORTER,
            text: "💡 Добавить [TYPE] свет [NAME]",
            arguments: {
              TYPE: {
                type: Scratch.ArgumentType.STRING,
                menu: "lightTypeMenu",
                defaultValue: "directional",
              },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "sun" },
            },
          },
          {
            opcode: "setLightPos",
            blockType: Scratch.BlockType.COMMAND,
            text: "💡 [NAME] позиция x:[X] y:[Y] z:[Z]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "sun" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
            },
          },
          {
            opcode: "setLightDir",
            blockType: Scratch.BlockType.COMMAND,
            text: "💡 [NAME] направление x:[X] y:[Y] z:[Z]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "sun" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: -0.5 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: -1 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: -0.5 },
            },
          },
          {
            opcode: "setLightColor",
            blockType: Scratch.BlockType.COMMAND,
            text: "💡 [NAME] цвет [COLOR] интенсивность [I]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "sun" },
              COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: "#ffffff" },
              I: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "setLightShadow",
            blockType: Scratch.BlockType.COMMAND,
            text: "💡 [NAME] тени [STATE]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "sun" },
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: "onOffMenu",
                defaultValue: "вкл",
              },
            },
          },
          {
            opcode: "removeLight",
            blockType: Scratch.BlockType.COMMAND,
            text: "🗑️ Удалить свет [NAME]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "sun" },
            },
          },
          {
            opcode: "setAmbient",
            blockType: Scratch.BlockType.COMMAND,
            text: "🌍 Фоновый свет цвет [COLOR] сила [I]",
            arguments: {
              COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: "#262630" },
              I: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: "🌍 Сцена и Эффекты",
          },
          {
            opcode: "setSkyColors",
            blockType: Scratch.BlockType.COMMAND,
            text: "🌅 Небо верх [TOP] горизонт [HOR] низ [BOT]",
            arguments: {
              TOP: { type: Scratch.ArgumentType.COLOR, defaultValue: "#1a4c8a" },
              HOR: { type: Scratch.ArgumentType.COLOR, defaultValue: "#7cb5e0" },
              BOT: { type: Scratch.ArgumentType.COLOR, defaultValue: "#c8dce8" },
            },
          },
          {
            opcode: "setSkyEnabled",
            blockType: Scratch.BlockType.COMMAND,
            text: "🌅 Небо [STATE]",
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: "onOffMenu",
                defaultValue: "вкл",
              },
            },
          },
          {
            opcode: "setFog",
            blockType: Scratch.BlockType.COMMAND,
            text: "🌫️ Туман [STATE] цвет [COLOR] ближний [NEAR] дальний [FAR]",
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: "onOffMenu",
                defaultValue: "вкл",
              },
              COLOR: { type: Scratch.ArgumentType.COLOR, defaultValue: "#b0b0b0" },
              NEAR: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 },
              FAR: { type: Scratch.ArgumentType.NUMBER, defaultValue: 80 },
            },
          },
          {
            opcode: "setShadows",
            blockType: Scratch.BlockType.COMMAND,
            text: "🌑 Тени [STATE]",
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: "onOffMenu",
                defaultValue: "вкл",
              },
            },
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: "✨ Пост-эффекты",
          },
          {
            opcode: "setBloom",
            blockType: Scratch.BlockType.COMMAND,
            text: "🌟 Bloom [STATE] сила [I]",
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: "onOffMenu",
                defaultValue: "вкл",
              },
              I: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.5 },
            },
          },
          {
            opcode: "setVignette",
            blockType: Scratch.BlockType.COMMAND,
            text: "🔲 Виньетка [STATE] сила [I]",
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: "onOffMenu",
                defaultValue: "вкл",
              },
              I: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1.5 },
            },
          },
          {
            opcode: "setChromaticAberration",
            blockType: Scratch.BlockType.COMMAND,
            text: "🌈 Хроматическая аберрация [STATE] сила [I]",
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: "onOffMenu",
                defaultValue: "выкл",
              },
              I: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },
          {
            opcode: "setColorCorrection",
            blockType: Scratch.BlockType.COMMAND,
            text: "🎨 Яркость [B] контраст [C] насыщенность [S]",
            arguments: {
              B: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              C: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              S: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
            },
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: "⚡ Физика",
          },
          {
            opcode: "enablePhysics",
            blockType: Scratch.BlockType.COMMAND,
            text: "⚡ Включить физику для [NAME]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
            },
          },
          {
            opcode: "setPhysicsStatic",
            blockType: Scratch.BlockType.COMMAND,
            text: "🧱 [NAME] статический [STATE]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "ground" },
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: "onOffMenu",
                defaultValue: "вкл",
              },
            },
          },
          {
            opcode: "setGravity",
            blockType: Scratch.BlockType.COMMAND,
            text: "🌍 Гравитация x:[X] y:[Y] z:[Z]",
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: -9.81 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "setVelocity",
            blockType: Scratch.BlockType.COMMAND,
            text: "💨 [NAME] скорость x:[X] y:[Y] z:[Z]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "addForce",
            blockType: Scratch.BlockType.COMMAND,
            text: "💥 [NAME] импульс x:[X] y:[Y] z:[Z]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              Z: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "setBounciness",
            blockType: Scratch.BlockType.COMMAND,
            text: "🏀 [NAME] упругость [B]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              B: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.5 },
            },
          },
          {
            opcode: "setFriction",
            blockType: Scratch.BlockType.COMMAND,
            text: "🧊 [NAME] трение [F]",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "myObject" },
              F: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.98 },
            },
          },
          {
            opcode: "isGrounded",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "⚡ [NAME] на земле?",
            arguments: {
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "player" },
            },
          },
          {
            opcode: "raycast",
            blockType: Scratch.BlockType.REPORTER,
            text: "🎯 Рейкаст из x:[OX] y:[OY] z:[OZ] направление x:[DX] y:[DY] z:[DZ]",
            arguments: {
              OX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              OY: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              OZ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              DX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              DY: { type: Scratch.ArgumentType.NUMBER, defaultValue: -1 },
              DZ: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: "🎮 Ввод",
          },
          {
            opcode: "isKeyDown",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "🎮 клавиша [KEY] нажата?",
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                menu: "keyMenu",
                defaultValue: "KeyW",
              },
            },
          },
          {
            opcode: "getMouseX",
            blockType: Scratch.BlockType.REPORTER,
            text: "🖱️ мышь X",
          },
          {
            opcode: "getMouseY",
            blockType: Scratch.BlockType.REPORTER,
            text: "🖱️ мышь Y",
          },
          {
            opcode: "isPointerLocked",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "🔒 указатель захвачен?",
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: "🔗 Иерархия объектов",
          },
          {
            opcode: "setParent",
            blockType: Scratch.BlockType.COMMAND,
            text: "🔗 [CHILD] привязать к [PARENT]",
            arguments: {
              CHILD: { type: Scratch.ArgumentType.STRING, defaultValue: "weapon" },
              PARENT: { type: Scratch.ArgumentType.STRING, defaultValue: "player" },
            },
          },

          {
            blockType: Scratch.BlockType.LABEL,
            text: "🛠️ Утилиты",
          },
          {
            opcode: "getFPS",
            blockType: Scratch.BlockType.REPORTER,
            text: "📊 FPS",
          },
          {
            opcode: "getObjectCount",
            blockType: Scratch.BlockType.REPORTER,
            text: "📊 количество объектов",
          },
          {
            opcode: "getAllObjectNames",
            blockType: Scratch.BlockType.REPORTER,
            text: "📋 список всех объектов",
          },
        ],
        menus: {
          shapeMenu: {
            acceptReporters: true,
            items: ["cube", "sphere", "plane", "cylinder", "cone", "torus"],
          },
          lightTypeMenu: {
            acceptReporters: true,
            items: ["directional", "point", "spot"],
          },
          cameraModeMenu: {
            acceptReporters: true,
            items: ["perspective", "orthographic"],
          },
          onOffMenu: {
            acceptReporters: true,
            items: ["вкл", "выкл"],
          },
          visMenu: {
            acceptReporters: true,
            items: ["показать", "скрыть"],
          },
          objPropMenu: {
            acceptReporters: true,
            items: ["x", "y", "z", "rotX", "rotY", "rotZ", "scaleX", "scaleY", "scaleZ"],
          },
          camPropMenu: {
            acceptReporters: true,
            items: ["x", "y", "z", "yaw", "pitch", "fov"],
          },
          keyMenu: {
            acceptReporters: true,
            items: [
              "KeyW", "KeyA", "KeyS", "KeyD",
              "Space", "ShiftLeft", "KeyE", "KeyQ",
              "KeyF", "KeyR", "KeyC", "KeyX",
              "Digit1", "Digit2", "Digit3",
              "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
            ],
          },
          materialPresetMenu: {
            acceptReporters: true,
            items: ["metal", "wood", "plastic", "glass", "rubber", "gold", "chrome", "neon", "lava", "ice"],
          },
        },
      };
    }

    initEngine(args) {
      if (renderer._initialized) renderer.destroy();
      renderer.init(Math.round(args.W), Math.round(args.H));
    }

    destroyEngine() {
      renderer.destroy();
    }

    renderScene() {
      if (!renderer._initialized) return;
      renderer.render();
    }

    updatePhysics(args) {
      if (!renderer._initialized) return;
      renderer.physics.update(Number(args.DT) || 0.016);
    }

    isInitialized() {
      return renderer._initialized;
    }

    createPrimitive(args) {
      if (!renderer._initialized) return "";
      const name = String(args.NAME);
      const obj = new Object3D(name);
      switch (String(args.SHAPE)) {
        case "cube": obj.geometry = Geometry.createCube(); break;
        case "sphere": obj.geometry = Geometry.createSphere(); break;
        case "plane": obj.geometry = Geometry.createPlane(); break;
        case "cylinder": obj.geometry = Geometry.createCylinder(); break;
        case "cone": obj.geometry = Geometry.createCone(); break;
        case "torus": obj.geometry = Geometry.createTorus(); break;
        default: obj.geometry = Geometry.createCube();
      }
      renderer.objects.set(name, obj);
      return name;
    }

    createSizedBox(args) {
      if (!renderer._initialized) return "";
      const name = String(args.NAME);
      const obj = new Object3D(name);
      obj.geometry = Geometry.createCube(Number(args.SX), Number(args.SY), Number(args.SZ));
      renderer.objects.set(name, obj);
      return name;
    }

    createTerrain(args) {
      if (!renderer._initialized) return "";
      const name = String(args.NAME);
      const h = Number(args.H);
      const obj = new Object3D(name);
      obj.geometry = Geometry.createTerrain(
        Number(args.W), Number(args.D),
        Number(args.S), Number(args.S),
        (u, v) => {
          
          const x = u * 10, z = v * 10;
          return (Math.sin(x * 1.5) * Math.cos(z * 1.5) +
                  Math.sin(x * 0.7 + 1) * Math.cos(z * 0.7 + 2) * 0.5) * h;
        }
      );
      renderer.objects.set(name, obj);
      return name;
    }

    loadOBJ(args) {
      if (!renderer._initialized) return "";
      const name = String(args.NAME);
      return new Promise((resolve) => {
        fetch(String(args.URL))
          .then((r) => r.text())
          .then((text) => {
            const obj = new Object3D(name);
            obj.geometry = Geometry.parseOBJ(text);
            renderer.objects.set(name, obj);
            resolve(name);
          })
          .catch(() => resolve(""));
      });
    }

    deleteObject(args) {
      const name = String(args.NAME);
      const obj = renderer.objects.get(name);
      if (obj && obj._vao && renderer.gl) {
        renderer.gl.deleteVertexArray(obj._vao);
      }
      renderer.objects.delete(name);
      
      const body = renderer.physics.bodies.find((b) => b.object.id === name);
      if (body) renderer.physics.removeBody(body);
    }

    deleteAllObjects() {
      for (const [, obj] of renderer.objects) {
        if (obj._vao && renderer.gl) renderer.gl.deleteVertexArray(obj._vao);
      }
      renderer.objects.clear();
      renderer.physics.bodies = [];
    }

    cloneObject(args) {
      if (!renderer._initialized) return "";
      const src = renderer.objects.get(String(args.NAME));
      if (!src) return "";
      const name = String(args.NEW_NAME);
      const obj = new Object3D(name);
      obj.position = src.position.clone();
      obj.rotation = src.rotation.clone();
      obj.scale = src.scale.clone();
      obj.color = [...src.color];
      obj.metallic = src.metallic;
      obj.roughness = src.roughness;
      obj.opacity = src.opacity;
      obj.emissive = [...src.emissive];
      obj.geometry = src.geometry; 
      obj.textureId = src.textureId;
      obj._dirty = true;
      renderer.objects.set(name, obj);
      return name;
    }

    objectExists(args) {
      return renderer.objects.has(String(args.NAME));
    }

    setPosition(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) obj.position.set(Number(args.X), Number(args.Y), Number(args.Z));
    }

    moveBy(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) {
        obj.position.x += Number(args.X);
        obj.position.y += Number(args.Y);
        obj.position.z += Number(args.Z);
      }
    }

    setRotation(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) obj.rotation.set(Number(args.X), Number(args.Y), Number(args.Z));
    }

    rotateBy(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) {
        obj.rotation.x += Number(args.X);
        obj.rotation.y += Number(args.Y);
        obj.rotation.z += Number(args.Z);
      }
    }

    setScale(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) obj.scale.set(Number(args.X), Number(args.Y), Number(args.Z));
    }

    setScaleUniform(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) { const s = Number(args.S); obj.scale.set(s, s, s); }
    }

    lookAtTarget(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) obj.lookAt(new Vec3(Number(args.X), Number(args.Y), Number(args.Z)));
    }

    getObjectProp(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (!obj) return 0;
      switch (String(args.PROP)) {
        case "x": return obj.position.x;
        case "y": return obj.position.y;
        case "z": return obj.position.z;
        case "rotX": return obj.rotation.x;
        case "rotY": return obj.rotation.y;
        case "rotZ": return obj.rotation.z;
        case "scaleX": return obj.scale.x;
        case "scaleY": return obj.scale.y;
        case "scaleZ": return obj.scale.z;
        default: return 0;
      }
    }

    setVisible(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) obj.visible = String(args.VIS) === "показать";
    }

    distanceBetween(args) {
      const a = renderer.objects.get(String(args.A));
      const b = renderer.objects.get(String(args.B));
      if (!a || !b) return 0;
      return a.position.distanceTo(b.position);
    }

    setColor(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) obj.color = hexToRGB(args.COLOR);
    }

    setColorRGB(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) obj.color = [Number(args.R)/255, Number(args.G)/255, Number(args.B)/255];
    }

    setMaterial(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) {
        obj.metallic = MathUtils.clamp(Number(args.M), 0, 1);
        obj.roughness = MathUtils.clamp(Number(args.R), 0.04, 1);
      }
    }

    setOpacity(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) obj.opacity = MathUtils.clamp(Number(args.O) / 100, 0, 1);
    }

    setEmissive(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) {
        const c = hexToRGB(args.COLOR);
        const i = Number(args.I);
        obj.emissive = [c[0] * i, c[1] * i, c[2] * i];
      }
    }

    setTexture(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) obj.textureId = String(args.TEX_ID);
    }

    loadTextureFromURL(args) {
      if (!renderer._initialized) return;
      renderer.loadTexture(String(args.ID), String(args.URL));
    }

    setPresetMaterial(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (!obj) return;
      const presets = {
        metal:   { color: [0.8, 0.8, 0.8], metallic: 1.0, roughness: 0.2, emissive: [0,0,0] },
        wood:    { color: [0.55, 0.35, 0.15], metallic: 0, roughness: 0.8, emissive: [0,0,0] },
        plastic: { color: [0.9, 0.1, 0.1], metallic: 0, roughness: 0.4, emissive: [0,0,0] },
        glass:   { color: [0.9, 0.95, 1.0], metallic: 0, roughness: 0.05, emissive: [0,0,0], opacity: 0.3 },
        rubber:  { color: [0.15, 0.15, 0.15], metallic: 0, roughness: 0.95, emissive: [0,0,0] },
        gold:    { color: [1.0, 0.84, 0.0], metallic: 1.0, roughness: 0.15, emissive: [0,0,0] },
        chrome:  { color: [0.95, 0.95, 0.95], metallic: 1.0, roughness: 0.05, emissive: [0,0,0] },
        neon:    { color: [0.1, 1.0, 0.5], metallic: 0, roughness: 0.5, emissive: [0.1, 1.0, 0.5] },
        lava:    { color: [0.8, 0.2, 0.0], metallic: 0, roughness: 0.7, emissive: [2, 0.5, 0.0] },
        ice:     { color: [0.7, 0.85, 1.0], metallic: 0, roughness: 0.1, emissive: [0,0,0], opacity: 0.7 },
      };
      const p = presets[String(args.PRESET)] || presets.plastic;
      obj.color = p.color;
      obj.metallic = p.metallic;
      obj.roughness = p.roughness;
      obj.emissive = p.emissive;
      if (p.opacity !== undefined) obj.opacity = p.opacity;
    }

    setCameraPos(args) {
      renderer.camera.position.set(Number(args.X), Number(args.Y), Number(args.Z));
    }

    setCameraTarget(args) {
      renderer.camera.target.set(Number(args.X), Number(args.Y), Number(args.Z));
    }

    setCameraLookAtObject(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (obj) renderer.camera.target = obj.position.clone();
    }

    setCameraFOV(args) {
      renderer.camera.fov = MathUtils.clamp(Number(args.FOV), 10, 170);
    }

    setCameraMode(args) {
      renderer.camera.mode = String(args.MODE);
    }

    enableFPSCamera(args) {
      renderer.camera._fpsMode = String(args.STATE) === "вкл";
    }

    updateFPSControls(args) {
      renderer.updateFPSCamera(Number(args.SENS), Number(args.S));
    }

    followObject(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (!obj) return;
      renderer.camera.position.set(
        obj.position.x + Number(args.OX),
        obj.position.y + Number(args.OY),
        obj.position.z + Number(args.OZ)
      );
      renderer.camera.target = obj.position.clone();
    }

    getCameraProp(args) {
      const cam = renderer.camera;
      switch (String(args.PROP)) {
        case "x": return cam.position.x;
        case "y": return cam.position.y;
        case "z": return cam.position.z;
        case "yaw": return cam.yaw;
        case "pitch": return cam.pitch;
        case "fov": return cam.fov;
        default: return 0;
      }
    }

    addLight(args) {
      const name = String(args.NAME);
      const light = new Light3D(name, String(args.TYPE));
      renderer.lights.set(name, light);
      return name;
    }

    setLightPos(args) {
      const l = renderer.lights.get(String(args.NAME));
      if (l) l.position.set(Number(args.X), Number(args.Y), Number(args.Z));
    }

    setLightDir(args) {
      const l = renderer.lights.get(String(args.NAME));
      if (l) l.direction.set(Number(args.X), Number(args.Y), Number(args.Z));
    }

    setLightColor(args) {
      const l = renderer.lights.get(String(args.NAME));
      if (l) {
        l.color = hexToRGB(args.COLOR);
        l.intensity = Number(args.I);
      }
    }

    setLightShadow(args) {
      const l = renderer.lights.get(String(args.NAME));
      if (l) l.castShadow = String(args.STATE) === "вкл";
    }

    removeLight(args) {
      renderer.lights.delete(String(args.NAME));
    }

    setAmbient(args) {
      renderer.ambientColor = hexToRGB(args.COLOR);
      renderer.ambientIntensity = Number(args.I);
    }

    setSkyColors(args) {
      renderer.skyColorTop = hexToRGB(args.TOP);
      renderer.skyColorHorizon = hexToRGB(args.HOR);
      renderer.skyColorBottom = hexToRGB(args.BOT);
    }

    setSkyEnabled(args) {
      renderer.skyEnabled = String(args.STATE) === "вкл";
    }

    setFog(args) {
      renderer.fogEnabled = String(args.STATE) === "вкл";
      renderer.fogColor = hexToRGB(args.COLOR);
      renderer.fogNear = Number(args.NEAR);
      renderer.fogFar = Number(args.FAR);
    }

    setShadows(args) {
      renderer.shadowEnabled = String(args.STATE) === "вкл";
    }

    setBloom(args) {
      renderer.bloomEnabled = String(args.STATE) === "вкл";
      renderer.bloomIntensity = Number(args.I);
    }

    setVignette(args) {
      renderer.vignetteEnabled = String(args.STATE) === "вкл";
      renderer.vignetteIntensity = Number(args.I);
    }

    setChromaticAberration(args) {
      renderer.chromaticEnabled = String(args.STATE) === "вкл";
      renderer.chromaticIntensity = Number(args.I);
    }

    setColorCorrection(args) {
      renderer.brightness = Number(args.B);
      renderer.contrast = Number(args.C);
      renderer.saturation = Number(args.S);
    }

    enablePhysics(args) {
      const obj = renderer.objects.get(String(args.NAME));
      if (!obj) return;
      const existing = renderer.physics.bodies.find((b) => b.object.id === obj.id);
      if (existing) return;
      renderer.physics.addBody(new PhysicsBody(obj));
    }

    setPhysicsStatic(args) {
      const body = renderer.physics.bodies.find((b) => b.object.id === String(args.NAME));
      if (body) body.isStatic = String(args.STATE) === "вкл";
    }

    setGravity(args) {
      renderer.physics.gravity.set(Number(args.X), Number(args.Y), Number(args.Z));
    }

    setVelocity(args) {
      const body = renderer.physics.bodies.find((b) => b.object.id === String(args.NAME));
      if (body) body.velocity.set(Number(args.X), Number(args.Y), Number(args.Z));
    }

    addForce(args) {
      const body = renderer.physics.bodies.find((b) => b.object.id === String(args.NAME));
      if (body) {
        body.velocity.x += Number(args.X);
        body.velocity.y += Number(args.Y);
        body.velocity.z += Number(args.Z);
      }
    }

    setBounciness(args) {
      const body = renderer.physics.bodies.find((b) => b.object.id === String(args.NAME));
      if (body) body.bounciness = MathUtils.clamp(Number(args.B), 0, 1);
    }

    setFriction(args) {
      const body = renderer.physics.bodies.find((b) => b.object.id === String(args.NAME));
      if (body) body.friction = MathUtils.clamp(Number(args.F), 0, 1);
    }

    isGrounded(args) {
      const body = renderer.physics.bodies.find((b) => b.object.id === String(args.NAME));
      if (!body) return false;
      const grounded = body.grounded;
      body.grounded = false;
      return grounded;
    }

    raycast(args) {
      const origin = new Vec3(Number(args.OX), Number(args.OY), Number(args.OZ));
      const dir = new Vec3(Number(args.DX), Number(args.DY), Number(args.DZ));
      const result = renderer.physics.raycast(origin, dir);
      if (!result) return "none";
      return JSON.stringify({
        object: result.body.object.id,
        distance: Math.round(result.distance * 100) / 100,
        x: Math.round(result.point.x * 100) / 100,
        y: Math.round(result.point.y * 100) / 100,
        z: Math.round(result.point.z * 100) / 100,
      });
    }

    isKeyDown(args) {
      return !!renderer._keys[String(args.KEY)];
    }

    getMouseX() {
      return renderer._mouse.x;
    }

    getMouseY() {
      return renderer._mouse.y;
    }

    isPointerLocked() {
      return renderer._mouse.locked;
    }

    setParent(args) {
      const child = renderer.objects.get(String(args.CHILD));
      const parent = renderer.objects.get(String(args.PARENT));
      if (child && parent) parent.addChild(child);
    }

    getFPS() {
      const now = performance.now();
      const fps = 1000 / (now - (renderer._lastTime || now));
      renderer._lastTime = now;
      return Math.round(fps);
    }

    getObjectCount() {
      return renderer.objects.size;
    }

    getAllObjectNames() {
      return [...renderer.objects.keys()].join(", ");
    }
  }

  Scratch.extensions.register(new Ultra3DExtension());
})(Scratch);
