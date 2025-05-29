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
                <div className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-sm text-slate-300 font-mono backdrop-blur-sm">
                  {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => connect({ connector: connectors[0] })}
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
