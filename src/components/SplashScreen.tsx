"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <div className="relative w-64 h-64 md:w-80 md:h-80 mb-2">
        <Image
          src="/images/_CJL-ProfileAccount_BW2.jpg"
          alt="The Show Pro Series"
          fill
          priority
          style={{ objectFit: "contain" }}
        />
      </div>
      <p 
        className="text-white text-2xl tracking-widest text-center mt-2"
        style={{ fontFamily: "'Simplifica', sans-serif", fontWeight: 'normal' }}
      >
        científico de tu juego
      </p>
    </div>
  );
}
