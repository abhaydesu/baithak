import { ImageResponse } from "next/og";

import { MARK_DATA_URL } from "@/lib/og/mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The logo mark on white, for home screens. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <img src={MARK_DATA_URL} width={105} height={118} alt="" />
      </div>
    ),
    size,
  );
}
