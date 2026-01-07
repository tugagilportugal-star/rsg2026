import React from 'react';
import { ASSETS } from '../config';

export const Speakers: React.FC = () => {
  return (
    <section
      id="speakers"
      className="py-24 md:py-32 relative text-white bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 30, 60, 0.75), rgba(0, 10, 20, 0.9)), url('${ASSETS.LISBON_BG}')`,
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-8">
          Palestrantes
        </h2>

        <p className="text-lg md:text-xl text-gray-200">
          Em breve anunciaremos os nossos oradores!
        </p>
      </div>
    </section>
  );
};
