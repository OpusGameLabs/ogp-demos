'use client';
import { OGPClaimButton, useOGPClaim } from "@opusgamelabs/claim-react";

export default function Home() {

  const { startClaim } = useOGPClaim();

  return (
    <div className="min-w-screen min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-center w-full">
        <h1 className="text-2xl font-extrabold">
          @opusgamelabs/claim-react Demo
        </h1>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full md:max-w-4xl">
        <div className="h-full w-full bg-zinc-800 shadow-lg rounded-lg p-4 flex flex-col space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">
              Default Claim Button
            </h1>
            <p className="text-xs text-gray-400">
              This will trigger the default claim flow. Simply wrap your app in <code className="bg-zinc-900/40">OGPClaimProvider</code> and use <code className="bg-zinc-900/40">{"<OGPClaimButton />"}</code> to render the button.
            </p>
          </div>
          <OGPClaimButton>
            Claim Your Rewards
          </OGPClaimButton>
        </div>
        <div className="h-full w-full bg-zinc-800 shadow-lg rounded-lg p-4 flex flex-col space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">
              Custom Claim Button
            </h1>
            <p className="text-xs text-gray-400">
              You can customize the button however you&apos;d like using the hooks provided.
            </p>
          </div>
          <button className="w-full bg-emerald-500 text-white px-4 py-2 rounded-lg" onClick={() => startClaim()}>
            Custom Claim Button
          </button>
        </div>
      </div>
    </div>
  );
}
