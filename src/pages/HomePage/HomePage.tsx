// src/pages/HomePage.tsx
import React, { useState } from 'react';
import Header from '../../components/Layouts/Header';
import HeroSection from '../../components/HomePage/HeroSection';
import SearchSection from '../../components/HomePage/SearchSection';
import FeaturesSection from '../../components/HomePage/FeaturesSection';
import TestimonialsSection from '../../components/HomePage/TestimonialsSection';
import NewsletterSection from '../../components/HomePage/NewsletterSection';
import Footer from '../../components/Layouts/Footer';
import HeritageCard from '../../components/HomePage/HeritageCard';
import { Heritage } from "../../types/heritage";


const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const sampleData: Heritage[] = [
    {
    id: 1,
    name: "Lễ hội Chùa Hương",
    lat: 20.5531,
    lng: 105.5872,
    description: "Lễ hội lớn nhất miền Bắc, diễn ra tại chùa Hương với nhiều hoạt động tâm linh.",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop",
    location: "Hà Nội",
    date: "15/01/2025",
    rating: 4.9,
    views: 12300,
    comments: 23,
    hasVR: true,
    trending: true,
    type: "festival",
    isHot: true,
    category: "festivals",
  },
  {
    id: 2,
    name: "Nhã nhạc Cung đình Huế",
    lat: 16.4637,
    lng: 107.5909,
    description: "Di sản văn hóa phi vật thể được UNESCO công nhận.",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=240&fit=crop",
    location: "Thừa Thiên Huế",
    date: "20/03/2025",
    rating: 4.8,
    views: 9800,
    comments: 14,
    hasVR: false,
    trending: true,
    type: "performance",
    isHot: true,
    category: "music",
  },
  {
    id: 3,
    name: "Múa rối nước Thăng Long",
    lat: 21.0285,
    lng: 105.8542,
    description: "Nghệ thuật múa rối nước truyền thống của Việt Nam.",
    image: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400&h=240&fit=crop",
    location: "Hà Nội",
    date: "25/02/2025",
    rating: 4.6,
    views: 7200,
    comments: 12,
    hasVR: true,
    trending: false,
    type: "performance",
    isHot: false,
    category: "performances",
  }
  ];

  const toggleFavorite = (id: number) => {
    const updated = new Set(favorites);
    updated.has(id) ? updated.delete(id) : updated.add(id);
    setFavorites(updated);
  };

  return (
    <>
      {/* <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} /> */}
      <HeroSection />
      <SearchSection 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleData.map((item) => (
            <HeritageCard 
              key={item.id} 
              item={item} 
              favorites={favorites} 
              toggleFavorite={toggleFavorite} 
            />
          ))}
        </div>
      </section>
      <FeaturesSection />
      <TestimonialsSection />
      <NewsletterSection />
      {/* <Footer /> */}
    </>
  );
};

export default HomePage;
