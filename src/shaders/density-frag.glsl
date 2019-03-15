#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

// POPULATION DENSITY MAP

float hash2D(vec2 x) {
	float i = dot(x, vec2(123.4031, 46.5244876));
	return fract(sin(i * 7.13) * 268573.103291);
}

float fade(float t) {
  return 6.0 * pow(t, 5.0) - 15.0 * pow(t, 4.0) + 10.0 * pow(t, 3.0);
}

// 2D Perlin noise
float perlin(vec2 q) {
  vec2 grads[4] = vec2[](vec2(1, 1), vec2(-1, 1), vec2(1, -1), vec2(-1, -1));
  vec2 p = q * 5.0;
  vec2 inCell = fract(p);

  vec2 x0y0 = floor(p);
  vec2 x1y0 = x0y0 + vec2(1.0, 0.0);
  vec2 x0y1 = x0y0 + vec2(0.0, 1.0);
  vec2 x1y1 = x0y0 + vec2(1.0);

  vec2 sw2p = p - x0y0;
  vec2 se2p = p - x1y0;
  vec2 nw2p = p - x0y1;
  vec2 ne2p = p - x1y1;

  vec2 grad00 = grads[int(hash2D(x0y0) * 4.0)];
  vec2 grad10 = grads[int(hash2D(x1y0) * 4.0)];
  vec2 grad01 = grads[int(hash2D(x0y1) * 4.0)];
  vec2 grad11 = grads[int(hash2D(x1y1) * 4.0)];

  float infSW = dot(sw2p, grad00);
  float infSE = dot(se2p, grad10);
  float infNW = dot(nw2p, grad01);
  float infNE = dot(ne2p, grad11);

  float b = mix(infSW, infSE, fade(inCell.x));
  float t = mix(infNW, infNE, fade(inCell.x));
  return mix(b, t, fade(inCell.y));
}

void main() {
  // vec2 q = vec2(perlin(fs_Pos - vec2(0.2)), perlin(fs_Pos + vec2(25.2, -22.8)));
  // out_Col = vec4(vec3(clamp(2.0 * perlin(q) - 0.3, 0.0, 1.0)), 1.0);
  // out_Col = vec4(0.5 * (fs_Pos + vec2(1.0)), 0.0, 0.4);
  out_Col = vec4(vec3(perlin(fs_Pos)), 0.85);
}