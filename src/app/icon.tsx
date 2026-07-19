import { ImageResponse } from "next/og";

export function generateImageMetadata() {
  return [
    { id: "192", size: { width: 192, height: 192 }, contentType: "image/png" },
    { id: "512", size: { width: 512, height: 512 }, contentType: "image/png" },
  ];
}

const SIZES: Record<string, number> = { "192": 192, "512": 512 };

export default function Icon({ id }: { id: string }) {
  const px = SIZES[id] ?? 192;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e08a72",
          color: "white",
          fontSize: px * 0.42,
          fontFamily: "serif",
        }}
      >
        {"T&S"}
      </div>
    ),
    { width: px, height: px },
  );
}
