'use client';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Category from './components/Category';
import FeaturedServices from './components/FeaturedServices';
import PopularServices from './components/PopularServices';
import AMCPackages from './components/AMCPackages';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import WelcomePopup from './components/WelcomePopup';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Category />
      <FeaturedServices />
      <PopularServices />
      <AMCPackages />
      <Testimonials />
      <FAQ />
      <Footer />
      <WelcomePopup />
    </>
  );
}
