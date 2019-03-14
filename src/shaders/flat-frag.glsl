#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

// TERRAIN MAP

float hash2D(vec2 x) {
	float i = dot(x, vec2(123.4031, 46.5244876));
	return fract(sin(i * 7.13) * 268573.103291);
}

// 2D noise
float noise(vec2 p) {
  vec2 corner = floor(p);
  vec2 inCell = fract(p);

  float bL = hash2D(corner);
  float bR = hash2D(corner + vec2(1.0, 0.0));
  float bottom = mix(bL, bR, inCell.x);

  vec2 tCorner = corner + vec2(0.0, 1.0);
  float tL = hash2D(tCorner);
  float tR = hash2D(tCorner + vec2(1.0, 0.0));
  float top = mix(tL, tR, inCell.x);

  return mix(bottom, top, inCell.y);
}

float fbm(vec2 q) {
  float acc = 0.0;
  float freqScale = 2.0;
  float invScale = 1.0 / freqScale;
  float freq = 1.0;
  float amp = 1.0;

  for (int i = 0; i < 3; ++i) {
    freq *= freqScale;
    amp *= invScale;
    acc += noise(q * freq) * amp;
  }
  return acc;
}

void main() {
  // out_Col = vec4(0.5 * (fs_Pos + vec2(1.0)), 0.0, 1.0);
  vec2 q = vec2(fbm(fs_Pos - vec2(0.2)), fbm(fs_Pos + vec2(25.2, -22.8)));
  out_Col = vec4(vec3(clamp(2.0 * fbm(q) - 0.3, 0.0, 1.0)), 1.0);

  // TODO: Toggle this with a checkbox
  if (out_Col.x < 0.57) {
    out_Col = vec4(0.0, 0.0, 1.0, 1.0);
  }
  else {
    out_Col = vec4(0.0, 1.0, 0.0, 1.0);
  }
}
