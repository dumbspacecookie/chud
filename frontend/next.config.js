/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: MediaPipe's modern Tasks API does NOT require SharedArrayBuffer/COEP.
  // The older `@mediapipe/face_mesh` package did, but `@mediapipe/tasks-vision`
  // (what we use) works without crossOriginIsolation. Keeping COEP off so the
  // Google Fonts <link> + the MediaPipe CDN wasm aren't blocked.
};
module.exports = nextConfig;
