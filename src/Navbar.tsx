import { useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { sdk } from "@farcaster/frame-sdk";

const Navbar = () => {
  const { isConnected, address, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const autoConnectIfMiniApp = async () => {
      try {
        const isMiniApp = await sdk.isInMiniApp();
        if (isMiniApp && !isConnected && connectors.length > 0) {
          const farcasterConnector = connectors.find(
            (c) => c.id === "farcasterFrame"
          );
          if (farcasterConnector) {
            console.log(
              "Attempting to auto-connect with Farcaster Frame connector..."
            );
            await connect({ connector: farcasterConnector });
          } else {
            console.log(
              "Farcaster Frame connector not found for auto-connect."
            );
          }
        }
      } catch (error) {
        console.error("Error during Mini App auto-connect:", error);
      }
    };
    autoConnectIfMiniApp();
  }, [isConnected, connect, connectors]);

  const handleButtonClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      const farcasterConnector = connectors.find(
        (c) => c.id === "farcasterFrame"
      );
      const injectedConnector = connectors.find((c) => c.id === "injected");
      if (
        farcasterConnector &&
        "ready" in farcasterConnector &&
        farcasterConnector.ready
      ) {
        connect({ connector: farcasterConnector });
      } else if (
        injectedConnector &&
        "ready" in injectedConnector &&
        injectedConnector.ready
      ) {
        connect({ connector: injectedConnector });
      } else if (injectedConnector) {
        console.warn(
          "Injected connector not 'ready' or 'ready' property not found, but attempting to connect."
        );
        connect({ connector: injectedConnector });
      } else if (farcasterConnector) {
        console.warn(
          "Farcaster connector not 'ready' or 'ready' property not found, but attempting to connect."
        );
        connect({ connector: farcasterConnector });
      } else if (connectors.length > 0) {
        console.warn(
          "Preferred connectors not available. Attempting to connect with the first available connector."
        );
        connect({ connector: connectors[0] });
      } else {
        console.warn("No suitable or available connectors found.");
      }
    }
  };

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
            {isConnecting ? (
              <div className="px-3 py-2 text-sm font-medium text-slate-300 animate-pulse">
                Connecting...
              </div>
            ) : (
              <button
                type="button"
                onClick={handleButtonClick}
                className="relative group overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium px-4 py-2 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-2">
                  {isConnected ? (
                    <>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm truncate max-w-[150px] sm:max-w-xs">
                        {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                      </span>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
