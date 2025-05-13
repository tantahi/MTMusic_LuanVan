'use client'

import React, { useState, useEffect } from 'react';
import { PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
}

const banners: Banner[] = [
  {
    id: '1',
    imageUrl: '/images/logo/banner1.jpg',
    title: 'Summer Hits 2024',
    description: 'Get ready for the hottest tracks of the season!'
  },
  {
    id: '2',
    imageUrl: '/images/logo/banner2.jpg',
    title: 'Classical Masterpieces',
    description: 'Timeless compositions from the greatest musicians'
  },
  {
    id: '3',
    imageUrl: '/images/logo/banner3.jpg!sw800',
    title: 'Rock Legends',
    description: 'Experience the power of iconic rock anthems'
  },
];

export default function MusicBannerSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + banners.length) % banners.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto my-8 h-[400px] overflow-hidden rounded-lg">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h2 className="text-4xl font-bold mb-2">{banner.title}</h2>
            <p className="text-lg mb-4">{banner.description}</p>
            <button className="bg-white text-black py-2 px-6 rounded-full font-semibold flex items-center hover:bg-opacity-90 transition-colors">
              <PlayCircle className="mr-2" />
              Play Now
            </button>
          </div>
        </div>
      ))}
      <button
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-20"
        onClick={goToPrevSlide}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full z-20"
        onClick={goToNextSlide}
      >
        <ChevronRight size={24} />
      </button>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}

