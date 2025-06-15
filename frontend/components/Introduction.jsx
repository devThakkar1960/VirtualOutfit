import React, { useState, useEffect } from 'react';

function Introduction() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const openModal = () => {
        setShowModal(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (!isModalOpen) {
            const timer = setTimeout(() => setShowModal(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isModalOpen]);

    return (
        <div className="relative font-poppins overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-blue-400 rounded-full opacity-20 blur-3xl animate-ping" />
                <div className="absolute bottom-10 right-10 w-60 h-60 bg-indigo-500 rounded-full opacity-25 blur-2xl animate-pulse" />
                <div className="absolute top-10 right-1/4 w-48 h-48 bg-purple-600 rounded-full opacity-10 blur-2xl animate-spin-slow" />
            </div>

            <div className="relative z-10 w-full h-[70vh] flex flex-col items-center justify-center gap-6 px-6 text-center bg-gradient-to-br from-white via-white-900 to-indigo-500">
                <h1 className="text-slate-800 text-6xl lg:text-7xl font-extrabold drop-shadow-2xl tracking-tight animate-fade-in-up font-">
                    Virtual Outfit
                </h1>
                <p className="text-black text-xl max-w-3xl font-light animate-fade-in delay-300">
                    Experience the future of fashion. Instantly preview AI-powered styles tailored just for you.
                </p>
                <button
                    onClick={openModal}
                    className="mt-6 px-8 py-3 rounded-full text-white font-semibold border border-indigo-300
                               bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                               bg-[length:200%_200%] bg-left animate-glow 
                               hover:bg-right transition-all duration-500 shadow-xl hover:shadow-indigo-400/40"
                >
                    How to use Virtual Outfit?
                </button>
            </div>

            {showModal && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center 
              bg-black/60 backdrop-blur-sm px-4 transition-opacity duration-500 ease-in-out ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    aria-modal="true"
                    role="dialog"
                >

                    <div
                        className={`backdrop-blur-xl bg-gradient-to-br from-slate-800/90 to-indigo-900/90 
                                    border border-white/10 shadow-2xl max-w-xl w-full rounded-2xl p-8 
                                    text-white relative transform transition-transform duration-500 ease-in-out ${isModalOpen ? 'scale-100' : 'scale-95'
                            }`}
                    >
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-5 text-white text-3xl hover:text-red-400 font-bold cursor-pointer"
                            aria-label="Close modal"
                        >
                            &times;
                        </button>
                        <h2 className="text-3xl font-semibold text-center mb-6 text-indigo-300">🧠 How It Works</h2>
                        <ol className="list-decimal list-inside space-y-4 text-lg">
                            <li>
                                Upload your image <span className="text-blue-300">(clear background preferred).</span>
                            </li>
                            <li>
                                Upload the clothing item image <span className="text-blue-300">(T-shirt, dress, etc.)</span>.
                            </li>
                            <li>
                                Choose from available categories: <strong>Upper</strong>, <strong>Lower</strong>, <strong>Full</strong>.
                            </li>
                            <li>
                                Click <span className="text-green-300 font-semibold">Submit</span> to generate your new virtual outfit!
                            </li>
                        </ol>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Introduction;
