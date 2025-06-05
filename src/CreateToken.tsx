import { useState, useEffect } from "react";
import { useWriteContract } from "wagmi";
import { formatEther, decodeEventLog, getEventSelector, AbiEvent } from "viem";
import { TOKEN_FACTORY_ABI } from "./abis/TokenFactory";
import { readContract } from "viem/actions";
import { usePublicClient } from "wagmi"; // Add this import
import sdk from "@farcaster/frame-sdk";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShareFromSquare } from "@fortawesome/free-solid-svg-icons";

const TOKEN_FACTORY_ADDRESS = import.meta.env.VITE_TOKEN_FACTORY_ADDRESS;

const CreateToken = () => {
  const { writeContract, isPending, error, data } = useWriteContract();
  const publicClient = usePublicClient();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("");
  const [imageURI, setImageURI] = useState("");
  const [status, setStatus] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [creationFee, setCreationFee] = useState<bigint | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchCreationFee() {
      try {
        const fee = await readContract(publicClient as any, {
          address: TOKEN_FACTORY_ADDRESS,
          abi: TOKEN_FACTORY_ABI,
          functionName: "CREATION_FEE",
        });
        setCreationFee(fee as bigint);
      } catch (err) {
        setStatus("Failed to fetch creation fee");
      }
    }
    if (publicClient) fetchCreationFee();
  }, [publicClient]);

  const createToken = () => {
    if (!name || !symbol || !initialSupply) {
      setStatus("Please fill in all required fields");
      return;
    }
    if (!creationFee) {
      setStatus("Fetching creation fee...");
      return;
    }
    setStatus("Creating token...");
    writeContract({
      address: TOKEN_FACTORY_ADDRESS,
      abi: TOKEN_FACTORY_ABI,
      functionName: "createToken",
      args: [name, symbol, BigInt(initialSupply), imageURI],
      value: creationFee,
    });
  };

  useEffect(() => {
    if (data && publicClient) {
      setStatus("Token created! Fetching address...");
      (publicClient as any)
        .waitForTransactionReceipt({ hash: data })
        .then((receipt: { logs: any[] }) => {
          // Find the TokenCreated event ABI from your ABI array
          const tokenCreatedAbi = TOKEN_FACTORY_ABI.find(
            (item) => item.type === "event" && item.name === "TokenCreated"
          ) as AbiEvent | undefined;
          if (!tokenCreatedAbi) {
            setStatus("TokenCreated event ABI not found.");
            return;
          }
          // Get the event selector (topic hash)
          const eventSelector = getEventSelector(tokenCreatedAbi);

          const tokenCreatedEvent = receipt.logs.find(
            (log: any) =>
              log.address.toLowerCase() ===
                TOKEN_FACTORY_ADDRESS.toLowerCase() &&
              log.topics[0] === eventSelector
          );

          if (tokenCreatedEvent) {
            const decodedLog = decodeEventLog({
              abi: TOKEN_FACTORY_ABI,
              data: tokenCreatedEvent.data,
              topics: tokenCreatedEvent.topics,
            });
            let address = "";
            if (Array.isArray(decodedLog.args)) {
              address = decodedLog.args[0];
            } else if (decodedLog.args && typeof decodedLog.args === "object") {
              address = (decodedLog.args as any).tokenAddress;
            }
            if (address) {
              setTokenAddress(address);
              setStatus(`Token created!`);
            } else {
              setTokenAddress("");
              setStatus("Unable to retrieve token address.");
            }
          } else {
            setTokenAddress("");
            setStatus("Unable to retrieve token address.");
          }
        })
        .catch(() => {
          setTokenAddress("");
          setStatus("Unable to retrieve token address.");
        });
    }
  }, [data, publicClient]);

  useEffect(() => {
    if (error) {
      setStatus(`Error: ${error.message}`);
    }
  }, [error]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-gradient-to-br from-[#244052] via-[#1e3a48] to-[#244052] rounded-2xl shadow-2xl border border-cyan-500/20 backdrop-blur-sm">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl mb-3 shadow-lg">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
            />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Create Token
        </h2>
        <p className="text-sm text-slate-400">
          Deploy your custom ERC-20 token
        </p>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Token Name */}
        <div className="group">
          <label className="block text-xs font-medium text-slate-300 mb-1 transition-colors group-focus-within:text-cyan-400">
            Token Name *
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
              placeholder="My Token"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
          </div>
        </div>

        {/* Token Symbol */}
        <div className="group">
          <label className="block text-xs font-medium text-slate-300 mb-1 transition-colors group-focus-within:text-cyan-400">
            Token Symbol *
          </label>
          <div className="relative">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all duration-200 backdrop-blur-sm uppercase"
              placeholder="TKN"
              maxLength={15}
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
          </div>
        </div>

        {/* Initial Supply */}
        <div className="group">
          <label className="block text-xs font-medium text-slate-300 mb-1 transition-colors group-focus-within:text-cyan-400">
            Initial Supply *
          </label>
          <div className="relative">
            <input
              type="number"
              value={initialSupply}
              onChange={(e) => setInitialSupply(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
              placeholder="1000000"
              min="1"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
          </div>
          <div className="flex gap-1 mt-2">
            <button
              type="button"
              onClick={() => setInitialSupply("1000000")}
              className="px-2 py-1 text-xs bg-slate-700/50 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-300 rounded border border-slate-600 hover:border-cyan-500/50 transition-all duration-200"
            >
              1M
            </button>
            <button
              type="button"
              onClick={() => setInitialSupply("5000000")}
              className="px-2 py-1 text-xs bg-slate-700/50 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-300 rounded border border-slate-600 hover:border-cyan-500/50 transition-all duration-200"
            >
              5M
            </button>
            <button
              type="button"
              onClick={() => setInitialSupply("100000000")}
              className="px-2 py-1 text-xs bg-slate-700/50 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-300 rounded border border-slate-600 hover:border-cyan-500/50 transition-all duration-200"
            >
              100M
            </button>
            <button
              type="button"
              onClick={() => setInitialSupply("1000000000")}
              className="px-2 py-1 text-xs bg-slate-700/50 hover:bg-cyan-600/20 text-slate-300 hover:text-cyan-300 rounded border border-slate-600 hover:border-cyan-500/50 transition-all duration-200"
            >
              1B
            </button>
          </div>
        </div>

        {/* Image URI */}
        <div className="group">
          <label className="block text-xs font-medium text-slate-300 mb-1 transition-colors group-focus-within:text-cyan-400">
            Image URI
            <span className="text-slate-500 font-normal ml-1">(optional)</span>
          </label>
          <div className="relative">
            <input
              type="url"
              value={imageURI}
              onChange={(e) => setImageURI(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 focus:outline-none transition-all duration-200 backdrop-blur-sm"
              placeholder="https://example.com/logo.png"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
          </div>
        </div>

        {/* Create Button */}
        <div className="sm:col-span-2">
          <button
            onClick={createToken}
            disabled={isPending}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium py-3 px-4 rounded-lg shadow-lg hover:shadow-cyan-500/25 disabled:shadow-none transition-all duration-300 transform hover:scale-[1.01] disabled:scale-100 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-2">
              {isPending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-sm">Creating Token...</span>
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="text-sm">Create Token</span>
                  <span className="text-cyan-200 text-xs">
                    {creationFee !== null
                      ? `(Fee: ${formatEther(creationFee)} ETH)`
                      : "(Fetching fee...)"}
                  </span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div
          className={`mb-4 p-3 rounded-lg border backdrop-blur-sm transition-all duration-300 ${
            status.includes("Error")
              ? "bg-red-900/20 border-red-500/30 text-red-400"
              : status.includes("created")
                ? "bg-green-900/20 border-green-500/30 text-green-400"
                : status.includes("Creating")
                  ? "bg-blue-900/20 border-blue-500/30 text-blue-400"
                  : "bg-amber-900/20 border-amber-500/30 text-amber-400"
          }`}
        >
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 mt-0.5">
              {status.includes("Error") ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 12a3 3 0 116 0 3 3 0 01-6 0z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zM8.757 8.757a.75.75 0 011.06 0L12 10.939l2.183-2.182a.75.75 0 111.06 1.06L13.061 12l2.182 2.183a.75.75 0 11-1.06 1.06L12 13.061l-2.183 2.182a.75.75 0 01-1.06-1.06L10.939 12 8.757 9.817a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : status.includes("created") ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.707 7.293a1 1 0 00-1.414-1.414L11 12.172 8.707 9.879a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l5-5z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 6a1 1 0 011 1v4a1 1 0 11-2 0V9a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium break-all">{status}</p>
            </div>
          </div>
          {tokenAddress && (
            <div className="mt-2 flex items-center justify-between bg-slate-800/20 p-2 rounded-md">
              <span className="text-xs text-slate-400 break-all">
                {tokenAddress}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(tokenAddress);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch (e) {
                      setCopied(false);
                    }
                  }}
                  className="p-1 rounded hover:bg-slate-700/30 transition-colors duration-200"
                >
                  {copied ? (
                    <span className="text-xs text-green-400 px-2">Copied!</span>
                  ) : (
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 5h-2a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 01-2-2 2 2 0 012 2z"></path>
                    </svg>
                  )}
                </button>
                <button
                  title="Share on Farcaster"
                  onClick={async () => {
                    const shareText = `I just created my token "${name}"! Create yours here!`;
                    const shareUrl = `https://forge-chi.vercel.app/`;
                    try {
                      await sdk.actions.composeCast({
                        text: shareText,
                        embeds: [shareUrl],
                      });
                    } catch (error) {
                      console.error("Failed to share :", error);
                      if (typeof toast !== "undefined" && toast.error) {
                        toast.error(
                          "Could not open Farcaster composer to share."
                        );
                      }
                    }
                  }}
                  className="p-1 rounded hover:bg-blue-600/20 transition-colors duration-200"
                >
                  <FontAwesomeIcon
                    icon={faShareFromSquare}
                    className="h-5 w-5 text-blue-500 hover:text-blue-700 transition-colors"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-center space-x-2 text-slate-500 text-xs">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12 1.586l-4.293 4.293a1 1 0 001.414 1.414L12 4.414l2.879 2.879a1 1 0 001.414-1.414L12 1.586zM3.293 9.293a1 1 0 011.414 0L12 16.586l7.293-7.293a1 1 0 111.414 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>Powered by Raize Team</span>
        </div>
      </div>
    </div>
  );
};

export default CreateToken;
