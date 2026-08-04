"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  Sentry.captureException(error);
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <NextError
          statusCode={500}
          title="Something went wrong on our end. Please try again."
        />
      </body>
    </html>
  );
}