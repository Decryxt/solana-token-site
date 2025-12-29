import React, { useState } from "react";
import { 
  FaShieldAlt, 
  FaChartBar, 
  FaBan, 
  FaUnlockAlt, 
  FaUserShield, 
  FaUserCheck, 
  FaUserTimes, 
  FaTimesCircle, 
  FaRegHandshake 
} from "react-icons/fa";

// Import your detail view components
import RevokeMintAuthority from "./RevokeMintAuthority";
import RevokeFreezeAuthority from "./RevokeFreezeAuthority";
import FreezeTokenAccount from "./FreezeTokenAccount";
import ThawTokenAccount from "./ThawTokenAccount"; // Import this new component
import TokenAnalyticsPanel from "./TokenAnalyticsPanel"; // <-- NEW
import SetAuthority from "./SetAuthority";
import ApproveDelegate from "./ApproveDelegate";
import RevokeDelegate from "./RevokeDelegate";
import CloseTokenAccount from "./CloseTokenAccount";

export default function TokenDashboard() {
  const maxWidthStyle = { maxWidth: "1000px" };
  const [showAuthorityOptions, setShowAuthorityOptions] = useState(false);
  const [fade, setFade] = useState(false);
  const [activeAuthorityDetail, setActiveAuthorityDetail] = useState(null);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false); // <-- NEW

  const authorityOptions = [
    {
      title: "Revoke Mint Authority",
      description: "Remove the ability to mint new tokens for increased security.",
      icon: <FaBan className="text-[#1CEAB9] text-3xl mb-2" />,
      price: "0.04 SOL",
      detailComponent: "RevokeMintAuthority",
    },
    {
      title: "Revoke Freeze Authority",
      description: "Remove the ability to freeze token accounts to prevent misuse.",
      icon: <FaUnlockAlt className="text-[#1CEAB9] text-3xl mb-2" />,
      price: "0.04 SOL",
      detailComponent: "RevokeFreezeAuthority",
    },
    {
      title: "Freeze Token Account",
      description: "Temporarily disable a token account, preventing transfers.",
      icon: <FaShieldAlt className="text-[#1CEAB9] text-3xl mb-2" />,
      price: "0.02 SOL",
      detailComponent: "FreezeTokenAccount",
    },
    {
      title: "Thaw Token Account",
      description: "Re-enable a previously frozen token account.",
      icon: <FaUserShield className="text-[#1CEAB9] text-3xl mb-2" />,
      price: "0.02 SOL",
      detailComponent: "ThawTokenAccount",
    },
    {
      title: "Set Authority",
      description: "Assign or change authority over token operations.",
      icon: <FaRegHandshake className="text-[#1CEAB9] text-3xl mb-2" />,
      price: "0.02 SOL",
      detailComponent: "SetAuthority",
    },
    {
      title: "Approve Delegate",
      description: "Authorize another account to manage tokens on your behalf.",
      icon: <FaUserCheck className="text-[#1CEAB9] text-3xl mb-2" />,
      price: "0.02 SOL",
      detailComponent: "ApproveDelegate",
    },
    {
      title: "Revoke Delegate",
      description: "Remove previously granted delegate permissions.",
      icon: <FaUserTimes className="text-[#1CEAB9] text-3xl mb-2" />,
      price: "0.02 SOL",
      detailComponent: "RevokeDelegate",
    },
    {
      title: "Close Token Account",
      description: "Permanently close a token account and reclaim rent.",
      icon: <FaTimesCircle className="text-[#1CEAB9] text-3xl mb-2" />,
      price: "0.01 SOL",
      detailComponent: "CloseTokenAccount",
    },
  ];

  // Updated: use detailComponent instead of title
  const handleAuthorityOptionClick = (title) => {
    const option = authorityOptions.find((opt) => opt.title === title);
    if (option?.detailComponent) {
      setFade(true);
      setTimeout(() => {
        setActiveAuthorityDetail(option.detailComponent);
        setFade(false);
      }, 300);
    } else {
      // No detail component for subscription-only items (for now)
    }
  };

  const handleManageAuthoritiesClick = () => {
    setFade(true);
    setTimeout(() => {
      setShowAuthorityOptions(true);
      setShowAnalyticsPanel(false);
      setActiveAuthorityDetail(null);
      setFade(false);
    }, 300);
  };

  const handleBackClick = () => {
    setFade(true);
    setTimeout(() => {
      setShowAuthorityOptions(false);
      setActiveAuthorityDetail(null);
      setFade(false);
    }, 300);
  };

  const handleDetailBackClick = () => {
    setFade(true);
    setTimeout(() => {
      setActiveAuthorityDetail(null);
      setFade(false);
    }, 300);
  };

  // NEW: show analytics panel
  const handleShowAnalyticsClick = () => {
    setFade(true);
    setTimeout(() => {
      setShowAnalyticsPanel(true);
      setShowAuthorityOptions(false);
      setActiveAuthorityDetail(null);
      setFade(false);
    }, 300);
  };

  const handleAnalyticsBackClick = () => {
    setFade(true);
    setTimeout(() => {
      setShowAnalyticsPanel(false);
      setFade(false);
    }, 300);
  };

  return (
    <div className="w-full mx-auto mt-4 mb-20 px-4">
      <div
        className="bg-[#0B0E11] border border-[#1CEAB9] rounded-2xl shadow-lg p-6 w-full mx-auto text-white mb-6"
        style={maxWidthStyle}
      >
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-3xl font-bold text-center leading-tight">
            Token Dashboard
          </h1>
          <p className="text-gray-400 text-center leading-tight">
            This page will show your created tokens and allow you to revoke mint and freeze authorities.
          </p>
        </div>
      </div>

      <div
        className={`bg-[#0B0E11] border border-[#1CEAB9] rounded-2xl shadow-lg p-6 mx-auto text-white transition-opacity duration-300 ${
          fade ? "opacity-0" : "opacity-100"
        }`}
        style={{
          maxWidth: "1400px",
          width: "100%",
          height: "calc(100vh - 250px)",
          overflowY: "auto",
        }}
      >
        {/* HOME SPLIT VIEW */}
        {!showAuthorityOptions &&
          !activeAuthorityDetail &&
          !showAnalyticsPanel && (
            <div className="flex h-full">
              {/* Left: Authority Actions */}
              <div className="w-1/2 pr-6 flex flex-col justify-between items-center">
                <div className="flex items-center space-x-3 mb-3">
                  <FaShieldAlt className="text-[#1CEAB9] text-2xl" />
                  <h2 className="text-xl font-semibold text-white">
                    Authority Actions
                  </h2>
                </div>
                <p className="text-gray-400 text-center mb-6 px-4">
                  Manage your tokens’ security by revoking mint and freeze authorities with ease.
                </p>
                <button
                  className="select-button"
                  onClick={handleManageAuthoritiesClick}
                >
                  Manage Authorities
                </button>
              </div>

              {/* Divider */}
              <div className="h-[90%] w-[2px] bg-[#1CEAB9] rounded-full opacity-60 mx-2 self-center"></div>

              {/* Right: Token Analytics */}
              <div className="w-1/2 pl-6 flex flex-col justify-between items-center">
                <div className="flex items-center space-x-3 mb-3">
                  <FaChartBar className="text-[#1CEAB9] text-2xl" />
                  <h2 className="text-xl font-semibold text-white">
                    Token Analytics
                  </h2>
                </div>
                <p className="text-gray-400 text-center mb-6 px-4">
                  View detailed analytics and performance data of your created tokens.
                </p>
                <button
                  className="select-button"
                  onClick={handleShowAnalyticsClick}
                >
                  Select Token to View Analytics
                </button>
              </div>
            </div>
          )}

        {/* AUTHORITY OPTIONS GRID */}
        {showAuthorityOptions && !activeAuthorityDetail && (
          <div className="flex flex-col h-full">
            <div className="flex justify-center items-center mb-6 space-x-3">
              <FaShieldAlt className="text-[#1CEAB9] text-3xl" />
              <h2 className="text-center text-3xl font-bold">
                Authority Actions
              </h2>
            </div>

            <div className="grid grid-cols-4 gap-6 px-4" style={{ flexGrow: 1 }}>
              {authorityOptions.map(({ title, description, icon, price }, i) => (
                <div
                  key={i}
                  className="relative bg-[#121619] border border-[#1CEAB9] rounded-lg p-4 cursor-pointer hover:bg-[#1CEAB9] hover:text-black transition flex flex-col items-center text-center"
                  style={{ minHeight: "100px" }}
                  title={description}
                  onClick={() => handleAuthorityOptionClick(title)}
                >
                  <div className="absolute top-2 right-3 text-xs font-semibold text-[#14b89c] select-none">
                    {price}
                  </div>

                  {icon}
                  <h3 className="font-semibold text-lg mb-1">{title}</h3>
                  <p className="text-gray-300 text-sm flex-grow">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <button
              className="select-button mt-4 self-center"
              onClick={handleBackClick}
              style={{ width: "200px" }}
            >
              Back
            </button>
          </div>
        )}

        {/* TOKEN ANALYTICS VIEW */}
        {showAnalyticsPanel && !activeAuthorityDetail && !showAuthorityOptions && (
          <div className="flex flex-col h-full">
            <div className="flex justify-center items-center mb-6 space-x-3">
              <FaChartBar className="text-[#1CEAB9] text-3xl" />
              <h2 className="text-center text-3xl font-bold">
                Token Analytics
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-2 sm:px-4">
              {/* Your analytics UI lives here */}
              <TokenAnalyticsPanel />
            </div>

            <button
              className="select-button mt-4 self-center"
              onClick={handleAnalyticsBackClick}
              style={{ width: "200px" }}
            >
              Back
            </button>
          </div>
        )}

        {/* Detail Views */}
        {activeAuthorityDetail === "RevokeMintAuthority" && (
          <div className="flex flex-col h-full">
            <RevokeMintAuthority onBack={handleDetailBackClick} />
          </div>
        )}

        {activeAuthorityDetail === "RevokeFreezeAuthority" && (
          <div className="flex flex-col h-full">
            <RevokeFreezeAuthority onBack={handleDetailBackClick} />
          </div>
        )}

        {activeAuthorityDetail === "FreezeTokenAccount" && (
          <div className="flex flex-col h-full">
            <FreezeTokenAccount onBack={handleDetailBackClick} />
          </div>
        )}

        {activeAuthorityDetail === "ThawTokenAccount" && (
          <div className="flex flex-col h-full">
            <ThawTokenAccount onBack={handleDetailBackClick} />
          </div>
        )}

        {activeAuthorityDetail === "SetAuthority" && (
          <div className="flex flex-col h-full">
            <SetAuthority onBack={handleDetailBackClick} />
          </div>
        )}

        {activeAuthorityDetail === "ApproveDelegate" && (
          <div className="flex flex-col h-full">
            <ApproveDelegate onBack={handleDetailBackClick} />
          </div>
        )}

        {activeAuthorityDetail === "RevokeDelegate" && (
          <div className="flex flex-col h-full">
            <RevokeDelegate onBack={handleDetailBackClick} />
          </div>
        )}

        {activeAuthorityDetail === "CloseTokenAccount" && (
          <div className="flex flex-col h-full">
            <CloseTokenAccount onBack={handleDetailBackClick} />
          </div>
        )}
      </div>

      <style jsx>{`
        .select-button {
          padding: 0.6rem 2.5rem;
          border-radius: 9999px;
          font-weight: 600;
          color: white;
          background-color: #0b0e11;
          border: 2px solid #14b89c;
          cursor: pointer;
          user-select: none;
          transition: background-color 0.3s ease, transform 0.3s ease;
          box-shadow: none;
        }
        .select-button:hover {
          background-color: #144f44;
          color: #1ceab9;
          box-shadow: none;
          transform: scale(1.03);
        }
      `}</style>
    </div>
  );
}
