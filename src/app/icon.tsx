import { ImageResponse } from "next/og";

import { MARK_DATA_URL } from "@/lib/og/mark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: the logo mark on its rounded cream tile, from the logo system. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9f7f3",
          borderRadius: 15,
        }}
      >
        <img src={MARK_DATA_URL} width={34} height={37} alt="" />
      </div>
    ),
    size,
  );
}
