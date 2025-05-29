import { sdk } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";
import CreateToken from "./CreateToken";
import Navbar from "./Navbar";

function App() {
  const [isFromRaize, setIsFromRaize] = useState(false);

  useEffect(() => {
    sdk.actions.ready();
    // Check if the URL has the 'ref=raize' parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get("ref") === "raize") {
      setIsFromRaize(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex items-center justify-center mt-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <CreateToken />
          {isFromRaize && (
            <div className="mt-6">
              <a
                href="https://your-raize-app-url.com"
                className="inline-block w-full text-center bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-md hover:shadow-emerald-500/50"
              >
                Back to Raize
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
