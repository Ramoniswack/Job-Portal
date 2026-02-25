'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Application } from '../DashboardLayout';
import { io, Socket } from 'socket.io-client';
import { Calendar, Clock, Briefcase, Wrench } from 'lucide-react';

interface MessagesSectionProps {
    currentUser: User | null;
    token: string;
    myApplications: Application[];
    onLoadApplications: () => void;
}

interface AcceptedConnection {
    _id: string;
    type: 'job' | 'service';  // Add type to distinguish between job and service bookings
    job?: {
        _id: string;
        title: string;
        description: string;
        category: string;
        budget: number;
    };
    service?: {
        _id: string;
        title: string;
        images: Array<{ url: string }>;
    };
    worker?: {
        _id: string;
        name: string;
        email: string;
    };
    client?: {
        _id: string;
        name: string;
        email: string;
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
            loadMessages(selectedConnection._id, selectedConnection.type);
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
            const allConnections: AcceptedConnection[] = [];

            // Load job applications (existing logic)
            if (currentUser?.role === 'worker') {
                const approvedApps = myApplications.filter(app => app.status === 'approved');
                const jobConnections = approvedApps.map(app => ({
                    _id: app._id,
                    type: 'job' as const,
                    job: app.job,
                    worker: app.worker,
                    client: typeof app.job.client === 'object' ? app.job.client : { _id: '', name: 'Unknown', email: '' },
                    status: app.status,
                    createdAt: app.createdAt,
                }));
                allConnections.push(...jobConnections);
            } else {
                const response = await fetch('http://localhost:5000/api/applications/job-applications', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success) {
                    const approvedApps = data.data.filter((app: Application) => app.status === 'approved');
                    const jobConnections = approvedApps.map((app: Application) => ({
                        _id: app._id,
                        type: 'job' as const,
                        job: app.job,
                        worker: app.worker,
                        client: typeof app.job.client === 'object' ? app.job.client : { _id: '', name: 'Unknown', email: '' },
                        status: app.status,
                        createdAt: app.createdAt,
                    }));
                    allConnections.push(...jobConnections);
                }
            }

            // Load approved service bookings
            // Load approved service bookings (where user is the service provider)
            try {
                console.log('=== LOADING SERVICE BOOKINGS FOR MESSAGES (PROVIDER) ===');
                const bookingsResponse = await fetch('http://localhost:5000/api/bookings/my-service-bookings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const bookingsData = await bookingsResponse.json();

                console.log('Service bookings response:', bookingsData);

                if (bookingsData.success && bookingsData.data) {
                    console.log('Processing', bookingsData.data.length, 'service provider bookings');

                    bookingsData.data.forEach((booking: any, index: number) => {
                        console.log(`\n--- Provider Booking ${index + 1} ---`);
                        console.log('Booking ID:', booking._id);
                        console.log('Service:', booking.service?.title);
                        console.log('Customer:', booking.customer);
                        console.log('Customer name:', booking.customer?.name);
                        console.log('Customer ID:', booking.customer?._id);
                        console.log('Status:', booking.status);

                        const customerData = {
                            _id: booking.customer?._id || '',
                            name: booking.customer?.name || booking.customerName || 'Unknown Customer',
                            email: booking.customer?.email || booking.customerEmail || ''
                        };

                        console.log('Customer data to add:', customerData);

                        allConnections.push({
                            _id: booking._id,
                            type: 'service' as const,
                            service: {
                                _id: booking.service?._id || '',
                                title: booking.service?.title || 'Service',
                                images: booking.service?.images || []
                            },
                            customer: customerData,
                            status: booking.status,
                            createdAt: booking.createdAt,
                            bookingDate: booking.bookingDate,
                            bookingTime: booking.bookingTime
                        });

                        console.log('Connection added. Total now:', allConnections.length);
                    });
                    console.log('\n✅ Total connections after adding provider bookings:', allConnections.length);
                } else {
                    console.log('❌ No provider bookings data or request failed');
                }
            } catch (error) {
                console.error('Error loading service bookings:', error);
            }

            // Load approved bookings as customer
            try {
                console.log('=== LOADING MY APPROVED BOOKINGS (CUSTOMER) ===');
                console.log('Token:', token ? 'exists' : 'missing');
                console.log('Current user:', currentUser?.email);

                const customerBookingsResponse = await fetch('http://localhost:5000/api/bookings/my-approved-bookings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                console.log('Response status:', customerBookingsResponse.status);
                console.log('Response ok:', customerBookingsResponse.ok);

                const customerBookingsData = await customerBookingsResponse.json();

                console.log('Customer bookings response:', customerBookingsData);
                console.log('Success:', customerBookingsData.success);
                console.log('Data length:', customerBookingsData.data?.length);

                if (customerBookingsData.success && customerBookingsData.data) {
                    console.log('Processing', customerBookingsData.data.length, 'customer bookings');

                    customerBookingsData.data.forEach((booking: any, index: number) => {
                        console.log(`\n--- Customer Booking ${index + 1} ---`);
                        console.log('Booking ID:', booking._id);
                        console.log('Service:', booking.service);
                        console.log('Service title:', booking.service?.title);
                        console.log('Service createdBy:', booking.service?.createdBy);
                        console.log('Provider name:', booking.service?.createdBy?.name);
                        console.log('Provider ID:', booking.service?.createdBy?._id);
                        console.log('Status:', booking.status);
                        console.log('Date:', booking.bookingDate);

                        const providerData = {
                            _id: booking.service?.createdBy?._id || '',
                            name: booking.service?.createdBy?.name || 'Service Provider',
                            email: booking.service?.createdBy?.email || ''
                        };

                        console.log('Provider data to add:', providerData);

                        allConnections.push({
                            _id: booking._id,
                            type: 'service' as const,
                            service: {
                                _id: booking.service?._id || '',
                                title: booking.service?.title || 'Service',
                                images: booking.service?.images || []
                            },
                            serviceProvider: providerData,
                            status: booking.status,
                            createdAt: booking.createdAt,
                            bookingDate: booking.bookingDate,
                            bookingTime: booking.bookingTime
                        });

                        console.log('Connection added. Total now:', allConnections.length);
                    });
                    console.log('\n✅ Total connections after adding customer bookings:', allConnections.length);
                } else {
                    console.log('❌ No customer bookings data or request failed');
                    if (!customerBookingsData.success) {
                        console.log('Error message:', customerBookingsData.message);
                    }
                }
            } catch (error) {
                console.error('❌ Error loading customer bookings:', error);
            }

            // Sort by creation date (newest first)
            allConnections.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setAcceptedConnections(allConnections);
            if (allConnections.length > 0 && !selectedConnection) {
                setSelectedConnection(allConnections[0]);
            }
        } catch (error) {
            console.error('Error loading connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (conversationId: string, conversationType: 'job' | 'service') => {
        try {
            console.log('=== LOADING MESSAGES ===');
            console.log('Conversation ID:', conversationId);
            console.log('Type:', conversationType);

            const response = await fetch(`http://localhost:5000/api/messages/${conversationId}?type=${conversationType}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            console.log('Messages response:', data);

            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedConnection || !currentUser) return;

        console.log('=== HANDLE SEND MESSAGE DEBUG ===');
        console.log('currentUser:', currentUser);
        console.log('currentUser.id:', (currentUser as any).id);
        console.log('currentUser._id:', (currentUser as any)._id);

        let receiverId: string;

        if (selectedConnection.type === 'job') {
            receiverId = currentUser.role === 'worker'
                ? selectedConnection.client?._id || ''
                : selectedConnection.worker?._id || '';
        } else {
            // For service bookings, determine receiver based on who the user is
            if (selectedConnection.customer) {
                // User is the service provider, receiver is customer
                receiverId = selectedConnection.customer._id;
            } else if (selectedConnection.serviceProvider) {
                // User is the customer, receiver is service provider
                receiverId = selectedConnection.serviceProvider._id;
            } else {
                receiverId = '';
            }
        }

        if (!receiverId) {
            console.error('No receiver ID found');
            return;
        }

        // Handle both id and _id fields (user dashboard vs admin dashboard)
        const senderId = (currentUser as any).id || (currentUser as any)._id;

        console.log('Extracted senderId:', senderId);
        console.log('Extracted receiverId:', receiverId);

        if (!senderId) {
            console.error('No sender ID found');
            console.error('currentUser object:', JSON.stringify(currentUser, null, 2));
            return;
        }

        const messageData: any = {
            senderId: senderId,
            receiverId: receiverId,
            content: messageText.trim(),
            conversationType: selectedConnection.type
        };

        if (selectedConnection.type === 'service') {
            messageData.bookingId = selectedConnection._id;
            messageData.type = 'service';
        } else {
            messageData.applicationId = selectedConnection._id;
            messageData.type = 'job';
        }

        console.log('=== SENDING MESSAGE ===');
        console.log('Sender ID:', senderId);
        console.log('Receiver ID:', receiverId);
        console.log('Message data:', messageData);
        console.log('Socket connected:', socket?.connected);

        // Clear input immediately for better UX
        setMessageText('');

        // Try Socket.IO first
        if (socket && socket.connected) {
            socket.emit('send_message', messageData);
            console.log('Message sent via Socket.IO');
            // Socket.IO will handle adding the message via receive_message event
        } else {
            console.log('Socket not connected, using HTTP fallback');

            // Only use HTTP if socket is not connected
            try {
                const response = await fetch('http://localhost:5000/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(messageData)
                });

                const data = await response.json();
                console.log('HTTP response:', data);

                if (data.success) {
                    // Add message to local state only when using HTTP fallback
                    setMessages(prev => [...prev, data.data]);
                    console.log('Message sent via HTTP successfully');
                } else {
                    console.error('HTTP send failed:', data.message);
                }
            } catch (error) {
                console.error('Error sending message via HTTP:', error);
            }
        }
    };

    if (acceptedConnections.length === 0) {
        return (
            <div className="p-8 h-full flex items-center justify-center">
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-md">
                    <span className="material-symbols-outlined text-gray-300 text-[64px]">chat_bubble_outline</span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-4">No Messages Yet</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        Once you approve service bookings or accept job applications, you can message customers and workers here
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8rem)]">
            <section className="flex flex-col w-96 bg-[#F8F9FA] border-r border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-white">
                    <h2 className="text-xl font-bold mb-4">Messages</h2>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                        <input
                            className="w-full bg-[#F8F9FA] border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
                            placeholder="Search chats..."
                            type="text"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {acceptedConnections.map((connection) => {
                        const isJobConnection = connection.type === 'job';
                        let otherUser;

                        if (isJobConnection) {
                            otherUser = currentUser?.role === 'worker' ? connection.client : connection.worker;
                        } else {
                            // For service bookings, show customer if user is provider, show provider if user is customer
                            otherUser = connection.customer || connection.serviceProvider;
                        }

                        const title = isJobConnection ? connection.job?.title : connection.service?.title;
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
                                    <div className="size-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                        {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white"></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-sm truncate">{otherUser?.name || 'Unknown'}</h3>
                                        <span className="text-[10px] font-medium text-gray-400">
                                            {new Date(connection.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                        {isJobConnection ? <Briefcase className="w-3 h-3 inline mr-1" /> : <Wrench className="w-3 h-3 inline mr-1" />}{title}
                                    </p>
                                    {!isJobConnection && connection.bookingDate && (
                                        <p className="text-xs text-gray-900 font-medium mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(connection.bookingDate).toLocaleDateString()} at {connection.bookingTime}
                                        </p>
                                    )}
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
                            <div className="size-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {selectedConnection.type === 'job'
                                    ? (currentUser?.role === 'worker'
                                        ? selectedConnection.client?.name
                                        : selectedConnection.worker?.name
                                    )?.charAt(0).toUpperCase()
                                    : (selectedConnection.customer?.name || selectedConnection.serviceProvider?.name)?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">
                                    {selectedConnection.type === 'job'
                                        ? (currentUser?.role === 'worker'
                                            ? selectedConnection.client?.name
                                            : selectedConnection.worker?.name)
                                        : (selectedConnection.customer?.name || selectedConnection.serviceProvider?.name || 'Unknown')}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <span className="size-2 bg-green-500 rounded-full"></span>
                                    <span className="text-xs text-gray-500">Active now</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-[#F8F9FA] rounded-lg text-gray-500 transition-colors">
                                <span className="material-symbols-outlined">call</span>
                            </button>
                            <button className="p-2 hover:bg-[#F8F9FA] rounded-lg text-gray-500 transition-colors">
                                <span className="material-symbols-outlined">videocam</span>
                            </button>
                            <button className="p-2 hover:bg-[#F8F9FA] rounded-lg text-gray-500 transition-colors">
                                <span className="material-symbols-outlined">info</span>
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 bg-[#F8F9FA]">
                        <div className="flex justify-center">
                            <span className="px-3 py-1 bg-white text-[10px] font-bold text-gray-400 uppercase tracking-widest rounded-full">
                                Today
                            </span>
                        </div>

                        <div className="flex justify-center">
                            <div className="bg-white border border-gray-200 rounded-xl p-4 max-w-md">
                                {selectedConnection.type === 'job' && selectedConnection.job ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="material-symbols-outlined text-[#26cf71] text-[20px]">work</span>
                                            <h4 className="font-semibold text-sm">{selectedConnection.job.title}</h4>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">{selectedConnection.job.description}</p>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 bg-[#F1F3F5] rounded-full text-xs font-medium text-gray-600">
                                                {selectedConnection.job.category}
                                            </span>
                                            <span className="px-2 py-1 bg-[#F1F3F5] rounded-full text-xs font-bold text-[#26cf71]">
                                                ${selectedConnection.job.budget}
                                            </span>
                                        </div>
                                    </>
                                ) : selectedConnection.service ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="material-symbols-outlined text-gray-900 text-[20px]">home_repair_service</span>
                                            <h4 className="font-semibold text-sm">{selectedConnection.service.title}</h4>
                                        </div>
                                        {selectedConnection.bookingDate && (
                                            <div className="text-xs text-gray-900 mb-2">
                                                <p className="font-semibold text-gray-900 flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(selectedConnection.bookingDate).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                <p className="mt-1 text-gray-900 flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {selectedConnection.bookingTime}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 bg-white text-gray-900 rounded-full text-xs font-medium shadow-sm border border-gray-200">
                                                Service Booking
                                            </span>
                                            <span className="px-2 py-1 bg-white text-gray-900 rounded-full text-xs font-medium shadow-sm border border-gray-200">
                                                {selectedConnection.status}
                                            </span>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </div>

                        {messages.map((message) => {
                            const isSent = message.sender._id === currentUser?.id;

                            return (
                                <div
                                    key={message._id}
                                    className={`flex gap-3 max-w-[80%] ${isSent ? 'flex-row-reverse self-end' : ''}`}
                                >
                                    <div className={`size-8 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-xs ${isSent ? 'bg-blue-500' : 'bg-blue-400'
                                        }`}>
                                        {message.sender.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`flex flex-col ${isSent ? 'items-end' : ''}`}>
                                        <div className={`p-4 rounded-xl ${isSent
                                            ? 'bg-[#FF6B35] text-white rounded-tr-none'
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
                        <div className="flex items-center gap-4 bg-[#F8F9FA] p-2 rounded-xl border border-gray-200 transition-all">
                            <button className="p-2 text-gray-400 hover:text-[#FF6B35] transition-colors">
                                <span className="material-symbols-outlined">add_circle</span>
                            </button>
                            <input
                                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-2"
                                placeholder="Type a message..."
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-[#FF6B35] transition-colors">
                                    <span className="material-symbols-outlined">mood</span>
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-[#FF6B35] text-white p-2.5 rounded-lg flex items-center justify-center hover:bg-[#1fb862] transition-colors shadow-lg shadow-green-200"
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
