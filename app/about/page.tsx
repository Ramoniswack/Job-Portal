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
    const [location, setLocation] = useState('Location');

    return (
        <>
            <Navbar location={location} setLocation={setLocation} />
            <AboutHero />
            <AboutMission />
            <Statistics />
            <HowItWorks />
            <WhyChooseUs />
            <JoinPlatform />
            <Footer />
        </>
    );
}
