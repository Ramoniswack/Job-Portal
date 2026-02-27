'use client';

import { useState } from 'react';
import { User } from './DashboardLayout';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
    currentUser: User | null;
    onLogout: () => void;
    onLoadJobs: () => void;
    onLoadAllJobs: () => void;
    onLoadApplications: () => void;
    onLoadMessages: () => void;
}

export default function EnhancedSidebar({
    activeSection,
    setActiveSection,
    currentUser,
    onLogout,
    onLoadJobs,
    onLoadAllJobs