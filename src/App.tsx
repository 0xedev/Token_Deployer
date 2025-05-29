import { sdk } from "@farcaster/frame-sdk";
import { useEffect } from "react";
import CreateToken from "./CreateToken";
import Navbar from "./Navbar";

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="flex items-center justify-center mt-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <CreateToken />
        </div>
      </div>
    </div>
  );
}

export default App;
