'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AboutHero from './components/AboutHero';
import AboutMission from './components/AboutMission';
import HowItWorks from './components/HowItWorks';
import WhyChooseUs from './components/WhyChooseUs';
import JoinPlatform from './components/JoinPlatform';
import Statistics from './components/Statistics';

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <AboutMission />
            <Statistics />
            <HowItWorks />
            <JoinPlatform />
            <Footer />
        </>
    );
}
