import React from 'react';
import Navbar from '../shared/Navbar';
import FeatureSection from '../components/FeatureSection';
import Introduction from './Introduction';
import Footer from './Footer';

function Home() {
  return (
    <>
      <Navbar />
      <Introduction />

      <div className="relative min-h-screen">

        <div
          className="fixed inset-0 -z-20"
          style={{
            background: `
      radial-gradient(circle at center, 
        #ffffff 0%, 
        #ffffff 75%, 
        #e0e7ff 90%, 
        #d8b4fe 100%)
    `
          }}
        />

        <div
          className="fixed top-10 left-10 -z-10 rounded-full opacity-40 blur-3xl"
          style={{
            width: '200px',
            height: '200px',
            background: 'rgba(75, 0, 130, 0.8)', // dark purple (indigo-ish)
            filter: 'blur(60px)',
          }}
        />


        <div
          className="fixed bottom-10 right-10 -z-10 rounded-full opacity-40 blur-3xl"
          style={{
            width: '200px',
            height: '200px',
            background: 'rgba(75, 0, 130, 0.8)', // same dark purple
            filter: 'blur(60px)',
          }}
        />

        <main
          className="relative
             bg-gradient-to-b
             from-transparent via-transparent to-transparent
             py-16 px-4 md:px-8 lg:px-16
             rounded-lg
             shadow-lg"
          style={{
            backgroundBlendMode: 'overlay, multiply',
          }}
        >
          {/* Upper Section with darker border and text */}
          <div className="mb-24 border-2 border-gray-700 rounded-lg p-6
                  bg-white/80
                  shadow-md">
            <FeatureSection
              title="Upper"
              description="Discover the latest upper body virtual outfits designed to fit your style and personality. Try it instantly with our smart upload and AI preview feature."
              videoSrc="\videos\upper.mp4"
              glow={false}
              titleClassName="text-gray-900 font-extrabold"
              descriptionClassName="text-gray-700"
            />
          </div>

          {/* Lower Section */}
          <div className="mb-24 border-2 border-gray-700 rounded-lg p-6
                  bg-white/80
                  shadow-md">
            <FeatureSection
              title="Lower"
              description="Explore trendy lower body apparel options that complement your look perfectly. Upload your photos and our AI will handle the rest."
              videoSrc="\videos\lower.mp4"
              glow={false}
              reverse
              titleClassName="text-gray-900 font-extrabold"
              descriptionClassName="text-gray-700"
            />
          </div>

          {/* Overall Section */}
          <div className="mb-24 border-2 border-gray-700 rounded-lg p-6
                  bg-white/80
                  shadow-md">
            <FeatureSection
              title="Overall"
              description="Experience the full outfit virtually before making your purchase. Our overall section offers the most realistic AI-powered try-on experience."
              videoSrc="\videos\overall.mp4"
              glow={false}
              titleClassName="text-gray-900 font-extrabold"
              descriptionClassName="text-gray-700"
            />
          </div>
        </main>

      </div>

      <Footer />
    </>
  );
}

export default Home;
