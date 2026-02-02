import React from "react";
import {
  FaEnvelope,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaDiscord,
  FaTelegram,
} from "react-icons/fa";

export default function Community() {
  const socials = [
    {
      name: "Gmail",
      icon: <FaEnvelope />,
      value: "OriginFi@originfi.net",
      link: "mailto:Originfi@originfi.net",
    },
    {
      name: "X",
      icon: <FaTwitter />,
      value: "@origin_Fi",
      link: "https://x.com/Origin_Fi",
    },
    {
      name: "Instagram",
      icon: <FaInstagram />,
      value: "@Origin.fi",
      link: "https://www.instagram.com/origin.fi/",
    },
    {
      name: "Facebook",
      icon: <FaFacebook />,
      value: "@OriginFi",
      link: "https://www.facebook.com/profile.php?id=61587222338227",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin />,
      value: "@Origin Fi",
      link: "https://www.linkedin.com/in/origin-fi-1791b13aa/",
    },
    {
      name: "Discord",
      icon: <FaDiscord />,
      value: "@OriginFi",
      link: "https://discord.gg/FDByVaZT",
    },
    {
      name: "Telegram",
      icon: <FaTelegram />,
      value: "@OriginFi",
      link: "t.me/origin_fi",
    },
  ];

  return (
    <div className="bg-[#0B0E11] p-8 rounded-lg shadow-lg max-w-xl w-full mx-auto border-2 border-[#1CEAB9]">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-white">
        Join the Community
      </h2>
      <ul className="space-y-5">
        {socials.map((item, index) => (
          <li key={index} className="flex items-center space-x-4 text-left">
            <span className="text-2xl text-[#3CA7F5]">{item.icon}</span>
            <div className="flex flex-col">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold hover:text-[#1CEAB9] transition"
              >
                {item.name}
              </a>
              <span className="text-gray-400 text-sm">{item.value}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
