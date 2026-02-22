'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
    const phoneNumber = '9779842416371'; // Nepal country code + number
    const message = 'Hello! I would like to inquire about your services.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20BA5A] transition-all duration-300 hover:scale-110 animate-pulse-slow"
        >
            <MessageCircle className="w-8 h-8" />
            <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7);
                    }
                    50% {
                        box-shadow: 0 0 0 15px rgba(37, 211, 102, 0);
                    }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }
            `}</style>
        </a>
    );
}
