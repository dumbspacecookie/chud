// "This is THE page Morty. The camera surface. Everything else is just
// scaffolding around this one *bzrp* twenty-line mounting point. Don't
// mess it up." — Terl, before going to lunch and not coming back.
import dynamic from "next/dynamic";

// CameraSurface uses browser-only APIs (getUserMedia, mediapipe wasm)
const CameraSurface = dynamic(() => import("@/components/CameraSurface"), { ssr: false });

export default function AppPage() {
  return (
    <CameraSurface
      onScan={(mode, raw) => {
        // M0: log only. Wire to postScan() in M1.
        // eslint-disable-next-line no-console
        console.log(`[scan] ${mode}  raw=${raw.toFixed(1)}`);
      }}
    />
  );
}
