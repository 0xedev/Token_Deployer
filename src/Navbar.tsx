import { useAccount, useConnect } from "wagmi";

const Navbar = () => {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  return (
    <nav className="bg-gradient-to-r from-[#244052] via-[#1e3a48] to-[#244052] border-b border-cyan-500/20 shadow-lg backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img
                src="/logo.png"
                alt="Forge Logo"
                className="h-8 w-8 rounded-lg shadow-md"
              />
            </div>
            <h1 className="text-xl font-bold text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Forge
            </h1>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center">
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-sm text-slate-300 font-mono backdrop-blur-sm truncate max-w-[150px] sm:max-w-xs">
                  {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const farcasterConnector = connectors.find(
                    (c) => c.id === "farcasterFrame" // More specific ID based on the connector name
                  );
                  const injectedConnector = connectors.find(
                    (c) => c.id === "injected"
                  );

                  // Prioritize Farcaster connector if it exists and is ready
                  // Using 'in' operator for a more robust type check for 'ready'
                  if (
                    farcasterConnector &&
                    "ready" in farcasterConnector &&
                    farcasterConnector.ready
                  ) {
                    connect({ connector: farcasterConnector });
                  }
                  // Else, prioritize Injected connector if it exists and is ready
                  else if (
                    injectedConnector &&
                    "ready" in injectedConnector &&
                    injectedConnector.ready
                  ) {
                    connect({ connector: injectedConnector });
                  }
                  // Fallback: If Injected connector exists (even if not strictly 'ready'), try it
                  else if (injectedConnector) {
                    console.warn(
                      "Injected connector not 'ready' or 'ready' property not found, but attempting to connect."
                    );
                    connect({ connector: injectedConnector });
                  }
                  // Fallback: If Farcaster connector exists (even if not strictly 'ready'), try it
                  else if (farcasterConnector) {
                    console.warn(
                      "Farcaster connector not 'ready' or 'ready' property not found, but attempting to connect."
                    );
                    connect({ connector: farcasterConnector });
                  }
                  // Last resort: if any connectors exist, try the first one.
                  else if (connectors.length > 0) {
                    console.warn(
                      "Preferred connectors not available. Attempting to connect with the first available connector."
                    );
                    connect({ connector: connectors[0] });
                  } else {
                    console.warn("No suitable or available connectors found.");
                  }
                }}
                className="relative group overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-sm">Connect Wallet</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
