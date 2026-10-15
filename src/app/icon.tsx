import { ImageResponse } from "next/og";

import { MARK_DATA_URL } from "@/lib/og/mark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: the logo mark, from the same source as everywhere else. */
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
        }}
      >
        <img src={MARK_DATA_URL} width={56} height={62} alt="" />
      </div>
    ),
    size,
  );
}
