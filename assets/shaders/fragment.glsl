precision mediump float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uMouse;

void main() {
  vec2 uv = vUv;

  /* subtle parallax (SAFE) */
  uv.x += (uMouse.x - 0.5) * 0.03;
  uv.y += (uMouse.y - 0.5) * 0.03;

  gl_FragColor = texture2D(uTexture, uv);
}
