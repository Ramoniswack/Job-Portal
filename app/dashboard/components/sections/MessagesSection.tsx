'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Application } from '../DashboardLayout';
import { io, Socket } from 'socket.io-client';

interface MessagesSectionProps {
    currentUser: User | null;
    token: string;
    myApplications: Application[];
    onLoadApplications: () => void;
}

interface AcceptedConnection {
    _id: string;
    job: {
        _id: string;
        title: string;
        description: string;
        category: string;
        budget: number;
    };
    worker: {
        _id: string;
        name: string;
        email: string;
    };
    client: {
        _id: string;
        name: string;
        email: string;
    };
    status: string;
    createdAt: string;
}

interface ChatMessage {
    _id: string;
    application: string;
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

export default function MessagesSection({
    currentUser,
    token,
    myApplications,
    onLoadApplications,
}: MessagesSectionProps) {
    const [acceptedConnections, setAcceptedConnections] = useState<AcceptedConnection[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<AcceptedConnection | null>(null);
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Socket.IO
    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    // Load accepted connections
    useEffect(() => {
        loadAcceptedConnections();
    }, [token, currentUser]);

    // Join conversation room and load messages when connection is selected
    useEffect(() => {
        if (selectedConnection && socket) {
            socket.emit('join_conversation', selectedConnection._id);
            loadMessages(selectedConnection._id);
        }
    }, [selectedConnection, socket]);

    // Listen for incoming messages
    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (message: ChatMessage) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socket.off('receive_message');
        };
    }, [socket]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadAcceptedConnections = async () => {
        if (!token) return;

        setLoading(true);
        try {
            if (currentUser?.role === 'worker') {
                const approvedApps = myApplications.filter(app => app.status === 'approved');
                const connections = approvedApps.map(app => ({
                    _id: app._id,
                    job: app.job,
                    worker: app.worker,
                    client: typeof app.job.client === 'object' ? app.job.client : { _id: '', name: 'Unknown', email: '' },
                    status: app.status,
                    createdAt: app.createdAt,
                }));
                setAcceptedConnections(connections);
                if (connections.length > 0 && !selectedConnection) {
                    setSelectedConnection(connections[0]);
                }
            } else {
                const response = await fetch('http://localhost:5000/api/applications/job-applications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    const approvedApps = data.data.filter((app: Application) => app.status === 'approved');
                    const connections = approvedApps.map((app: Application) => ({
                        _id: app._id,
                        job: app.job,
                        worker: app.worker,
                        client: typeof app.job.client === 'object' ? app.job.client : { _id: '', name: 'Unknown', email: '' },
                        status: app.status,
                        createdAt: app.createdAt,
                    }));
                    setAcceptedConnections(connections);
                    if (connections.length > 0 && !selectedConnection) {
                        setSelectedConnection(connections[0]);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (applicationId: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/messages/${applicationId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedConnection || !currentUser || !socket) return;

        const receiverId = currentUser.role === 'worker'
            ? selectedConnection.client._id
            : selectedConnection.worker._id;

        socket.emit('send_message', {
            applicationId: selectedConnection._id,
            senderId: currentUser.id,
            receiverId: receiverId,
            content: messageText.trim()
        });

        setMessageText('');
    };

    if (acceptedConnections.length === 0) {
        return (
            <div className="p-8 h-full flex items-center justify-center">
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-md">
                    <span className="material-symbols-outlined text-gray-300 text-[64px]">chat_bubble_outline</span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">No Messages Yet</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        {currentUser?.role === 'worker'
                            ? 'Once your applications are accepted, you can message clients here'
                            : 'Once you accept applications, you can message workers here'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8rem)]">
            <section className="flex flex-col w-96 bg-gray-50 border-r border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-white">
                    <h2 className="text-xl font-bold mb-4">Messages</h2>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                        <input
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#26cf71] focus:border-transparent"
                            placeholder="Search chats..."
                            type="text"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {acceptedConnections.map((connection) => {
                        const otherUser = currentUser?.role === 'worker' ? connection.client : connection.worker;
                        const userRole = currentUser?.role === 'worker' ? 'Client' : 'Worker';
                        const isSelected = selectedConnection?._id === connection._id;

                        return (
                            <div
                                key={connection._id}
                                onClick={() => setSelectedConnection(connection)}
                                className={`p-4 flex gap-4 cursor-pointer transition-colors ${isSelected
                                        ? 'bg-white border-l-4 border-[#26cf71]'
                                        : 'hover:bg-white border-l-4 border-transparent'
                                    }`}
                            >
                                <div className="relative shrink-0">
                                    <div className="size-12 rounded-full bg-[#26cf71] flex items-center justify-center text-white font-bold text-lg">
                                        {otherUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white"></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-sm truncate">{otherUser.name}</h3>
                                        <span className="text-[10px] font-medium text-gray-400">
                                            {new Date(connection.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${userRole === 'Client'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-green-100 text-[#26cf71]'
                                            }`}>
                                            {userRole}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{connection.job.title}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {selectedConnection && (
                <main className="flex-1 flex flex-col bg-white">
                    <header className="h-20 border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full bg-[#26cf71] flex items-center justify-center text-white font-bold">
                                {(currentUser?.role === 'worker'
                                    ? selectedConnection.client.name
                                    : selectedConnection.worker.name
                                ).charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">
                                    {currentUser?.role === 'worker'
                                        ? selectedConnection.client.name
                                        : selectedConnection.worker.name}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="size-2 bg-green-500 rounded-full"></span>
                                    <span className="text-xs text-gray-500">Active now</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                                <span className="material-symbols-outlined">call</span>
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                                <span className="material-symbols-outlined">videocam</span>
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors">
                                <span className="material-symbols-outlined">info</span>
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-gray-50">
                        <div className="flex justify-center">
                            <span className="px-3 py-1 bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest rounded-full">
                                Today
                            </span>
                        </div>

                        <div className="flex justify-center">
                            <div className="bg-white border border-gray-200 rounded-xl p-4 max-w-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-[#26cf71] text-[20px]">work</span>
                                    <h4 className="font-semibold text-sm">{selectedConnection.job.title}</h4>
                                </div>
                                <p className="text-xs text-gray-600 mb-2">{selectedConnection.job.description}</p>
                                <div className="flex gap-2">
                                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                        {selectedConnection.job.category}
                                    </span>
                                    <span className="px-2 py-1 bg-green-100 rounded-full text-xs font-bold text-[#26cf71]">
                                        ${selectedConnection.job.budget}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {messages.map((message) => {
                            const isSent = message.sender._id === currentUser?.id;

                            return (
                                <div
                                    key={message._id}
                                    className={`flex gap-3 max-w-[80%] ${isSent ? 'flex-row-reverse self-end' : ''}`}
                                >
                                    <div className={`size-8 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-xs ${isSent ? 'bg-[#26cf71]' : 'bg-gray-400'
                                        }`}>
                                        {message.sender.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`flex flex-col ${isSent ? 'items-end' : ''}`}>
                                        <div className={`p-4 rounded-xl ${isSent
                                                ? 'bg-[#26cf71] text-white rounded-tr-none'
                                                : 'bg-white border border-gray-200 rounded-tl-none'
                                            }`}>
                                            <p className="text-sm">{message.content}</p>
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1">
                                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <footer className="p-6 border-t border-gray-200 shrink-0 bg-white">
                        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-[#26cf71] focus-within:bg-white transition-all">
                            <button className="p-2 text-gray-400 hover:text-[#26cf71] transition-colors">
                                <span className="material-symbols-outlined">add_circle</span>
                            </button>
                            <input
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
                                placeholder="Type a message..."
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-[#26cf71] transition-colors">
                                    <span className="material-symbols-outlined">mood</span>
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-[#26cf71] text-white p-2.5 rounded-lg flex items-center justify-center hover:bg-[#1fb862] transition-colors shadow-lg shadow-green-200"
                                >
                                    <span className="material-symbols-outlined text-xl">send</span>
                                </button>
                            </div>
                        </div>
                    </footer>
                </main>
            )}
        </div>
    );
}
