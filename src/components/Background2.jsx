import React from "react";

export default function Background2() {
  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .background2 {
          position: absolute;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: -10;
          overflow: hidden;
        }

        .background2 img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .gradient-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            270deg,
            rgba(70, 130, 180, 0.10),   /* steelblue */
            rgba(138, 43, 226, 0.10),   /* purple */
            rgba(219, 112, 147, 0.10),  /* palevioletred */
            rgba(123, 104, 238, 0.10),  /* mediumslateblue */
            rgba(70, 130, 180, 0.10)
          );
          background-size: 1500% 1500%;
          animation: gradientShift 25s ease infinite;
          mix-blend-mode: screen;
        }
      `}</style>

      <div className="background2">
        <img src="/images/286252.jpg" alt="Background" />
        <div className="gradient-overlay" />
      </div>
    </>
  );
}
