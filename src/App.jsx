import React from "react";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { ReclaimProofRequest } from "@reclaimprotocol/js-sdk";

function ReclaimDemo() {
  const [requestUrl, setRequestUrl] = useState("");
  const [proofs, setProofs] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const checkMobile =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        navigator.userAgent.toLowerCase()
      ) ||
      (typeof window.orientation !== "undefined" ? window.orientation : -1) >
        -1;
    setIsMobile(checkMobile);
  }, []);

  const getVerificationReq = async () => {
    setProofs([]);
    setRequestUrl("");
    const APP_ID = "0x8A852A17D50E59b8c68b0216Dd549b5754A2ba48";
    const APP_SECRET =
      "0x44e97a337f6c3bfc1c6975ba31394aea6343d539aa902e2ad62a7366e4b8f37d";
    const PROVIDER_ID = "32f0bcaf-73fe-4937-8bb8-43d608318845";

    const isMobile =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        navigator.userAgent.toLowerCase()
      ) ||
      (typeof window.orientation !== "undefined" ? window.orientation : -1) >
        -1;

    const isIOS =
      /mac|iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase()) || false;

    const deviceType = isMobile ? (isIOS ? "ios" : "android") : "desktop";

    const reclaimProofRequest = await ReclaimProofRequest.init(
      APP_ID,
      APP_SECRET,
      PROVIDER_ID,
      {
        useAppClip: deviceType !== "desktop",
        device: deviceType,
      }
    );

    reclaimProofRequest.setParams({
      username: username,
    });

    const requestUrl = await reclaimProofRequest.getRequestUrl();
    console.log("Request URL:", requestUrl);
    setRequestUrl(requestUrl);

    await reclaimProofRequest.startSession({
      onSuccess: (proofs) => {
        if (proofs) {
          if (typeof proofs === "string") {
            console.log("SDK Message:", proofs);
            setProofs([proofs]);
          } else if (typeof proofs !== "string") {
            if (Array.isArray(proofs)) {
              console.log(
                "Verification success",
                JSON.stringify(proofs.map((p) => p.claimData.context))
              );
              setProofs(proofs);
            } else {
              console.log("Verification success", proofs?.claimData.context);
              setProofs(proofs);
            }
          }
        }
      },
      onError: (error) => {
        console.error("Verification failed", error);
      },
    });
  };

  const handleOpenLink = () => {
    if (requestUrl) {
      window.open(requestUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="w-full max-w-md">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Instagram Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter Instagram username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={getVerificationReq}
            disabled={!username}
            className={`mt-4 w-full max-w-md py-2 px-4 rounded-md transition-colors duration-200 font-medium ${
              username
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Get Verification Request
          </button>
        </div>

        {requestUrl && (
          <div className="w-full p-2 mt-2 bg-white z-10">
            <div className="flex flex-col items-center gap-2 mt-2">
              <h3 className="text-base sm:text-lg font-medium">
                {isMobile ? "" : "Scan to generate proof"}
              </h3>
              {isMobile ? (
                <button
                  onClick={handleOpenLink}
                  className="w-full py-4 h-auto text-base bg-[#0000ee] text-white rounded-[10px]"
                >
                  Verify Now
                </button>
              ) : (
                <div className="rounded-lg">
                  <QRCode
                    value={requestUrl}
                    size={160}
                    className="w-full max-w-[120px] sm:max-w-[160px] h-auto"
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {proofs && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verification Successful!
            </h2>
            <div className="relative">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      JSON.stringify(proofs, null, 2)
                    );
                    alert("Copied to clipboard!");
                  } catch (err) {
                    console.error("Failed to copy:", err);
                  }
                }}
                className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 bg-white rounded-md shadow-sm"
                title="Copy to clipboard"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              </button>
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(proofs, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReclaimDemo;
