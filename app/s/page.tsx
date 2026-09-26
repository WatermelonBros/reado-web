import type { Metadata } from "next";
import { Suspense } from "react";
import { ExcerptView } from "@/components/share/ExcerptView";

export const metadata: Metadata = {
  title: "Shared code",
  robots: { index: false },
};

export default function Page() {
  return (
    <Suspense>
      <ExcerptView />
    </Suspense>
  );
}
