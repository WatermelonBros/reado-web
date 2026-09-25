import type { Metadata } from "next";
import { Suspense } from "react";
import { OrgView } from "@/components/account/OrgView";

export const metadata: Metadata = {
  title: "Organizations",
  robots: { index: false },
  alternates: { canonical: "/account/org" },
};

export default function Page() {
  // useSearchParams (?id=, ?connected=, ?error=) needs a Suspense boundary in a static export.
  return (
    <Suspense>
      <OrgView />
    </Suspense>
  );
}
