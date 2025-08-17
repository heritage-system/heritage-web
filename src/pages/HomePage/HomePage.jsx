// src/pages/HomePage.jsx
import React, { useState } from 'react';
import Header from '../../components/HomePage/Header';
import HeroSection from '../../components/HomePage/HeroSection';
import SearchSection from '../../components/HomePage/SearchSection';
import FeaturesSection from '../../components/HomePage/FeaturesSection';
import TestimonialsSection from '../../components/HomePage/TestimonialsSection';
import NewsletterSection from '../../components/HomePage/NewsletterSection';
import Footer from '../../components/HomePage/Footer';
import HeritageCard from '../../components/HomePage/HeritageCard';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState(new Set());

  const sampleData = [
  {
    id: 1,
    name: "Lễ hội Chùa Hương",
    description: "Lễ hội lớn nhất miền Bắc, diễn ra tại chùa Hương.",
    image: "https://cdn.hoabinhevents.com/hbt/wp-content/uploads/2025/01/13112338/le-hoi-chua-huong.jpg",
    location: "Hà Nội",
    date: "15/01/2025",
    rating: 4.9,
    views: 12345,
    comments: 23,
    hasVR: true,
    trending: true
  },
  {
    id: 2,
    name: "Nhã nhạc Cung đình Huế",
    description: "Di sản văn hóa phi vật thể được UNESCO công nhận.",
    image: "https://static.vinwonders.com/production/optimize_nha-nhac-cung-dinh-hue-topbanner_optimized.jpg",
    location: "Thừa Thiên Huế",
    date: "20/03/2025",
    rating: 4.8,
    views: 9800,
    comments: 14,
    hasVR: false,
    trending: true
  },
  {
    id: 3,
    name: "Lễ hội Kate của người Chăm",
    description: "Lễ hội truyền thống của đồng bào Chăm tại tháp Pô Nagar.",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=240&fit=crop",
    location: "Ninh Thuận",
    date: "10/10/2025",
    rating: 4.7,
    views: 8600,
    comments: 8,
    hasVR: true,
    trending: false
  }
];

  const toggleFavorite = (id) => {
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
