import React from 'react';

function FeatureSection({ title, description, videoSrc, glow, reverse }) {
  return (
    <section
      className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
        } items-center justify-between gap-16 lg:gap-20 px-4 sm:px-8`}
    >
      {/* Text Section */}
      <div className="lg:w-1/2 text-center lg:text-left space-y-5">
        <h2 className="text-4xl md:text-5xl font-semibold font-poppins leading-tight text-gray-900">
          {title}
        </h2>
        <p className="text-lg md:text-xl font-light font-poppins tracking-wide leading-relaxed text-gray-700">
          {description}
        </p>
      </div>

      {/* Video Section */}
      <div className="lg:w-1/2">
        <div
          className={`rounded-xl overflow-hidden transition-shadow duration-500 ${glow
              ? 'shadow-[0_0_30px_#7c3aed] hover:shadow-[0_0_50px_#4338ca]'
              : ''
            }`}
        >
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
