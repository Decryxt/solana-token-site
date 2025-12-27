import React from "react";

export default function Background() {
  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 40%, center, center;
          }
          50% {
            background-position: 100% 60%, center, center;
          }
          100% {
            background-position: 0% 40%, center, center;
          }
        }
        #bg-wrap {
          background-image:
            linear-gradient(
              270deg,
              rgba(138, 43, 226, 0.5),
              rgba(30, 144, 255, 0.5),
              rgba(50, 205, 50, 0.5),
              rgba(255, 69, 0, 0.5)
            ),
            linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
            url('/images/2180141.jpg');
          background-size: 1400% 1400%, cover, cover;
          background-repeat: no-repeat, no-repeat, no-repeat;
          animation: gradientShift 18s ease infinite;
          width: 100vw;
          height: 100vh;
          position: absolute;
          inset: 0;
          z-index: -10;
          background-position: 0% 40%, center, center;
        }
      `}</style>

      <div id="bg-wrap" />
    </>
  );
}
