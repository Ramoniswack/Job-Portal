'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Calendar, Clock, Briefcase, Wrench } from 'lucide-react';

interface MessagesSectionProps {
    token: string;
}

interface AcceptedConnection {
    _id: string;
    type: 'service';
    service?: {
        _id: string;
        title: string;
        images: Array<{ url: string }>;
    };
    customer?: {
        _id: string;
        name: string;
        email: string;
    };
    serviceProvider?: {
        _id: string;
        name: string;
        email: string;
    };
    status: string;
    createdAt: string;
    bookingDate?: string;
    bookingTime?: string;
}

interface ChatMessage {
    _id: string;
    sender: {
        _id: string;
        name: string;
        email: string;
    };
    receiver: {
        _id: string;
        name: string;
        email: string;
    };
    content: string;
    read: boolean;
    createdAt: string;
}

export default function MessagesSection({ token }: MessagesSectionProps) {
    const [acceptedConnections, setAcceptedConnections] = useState<AcceptedConnection[]>([]);
    const [loading, setLoading] = useState(false);
    cons