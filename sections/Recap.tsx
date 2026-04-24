import React, { useState, useEffect, useCallback } from 'react';
import { Section } from '../components/UIComponents';
import { Star, Play, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { ASSETS } from '../config';

export const Recap: React.FC<{ onOpenTicketModal: () => void }> = ({ onOpenTicketModal }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  useEffect(() => {
    const shuffled = [...ASSETS.GALLERY_IMAGES];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setGalleryImages(shuffled);
  }, []);

  const stats = [
    { value: '+170', label: 'Participantes' },
    { value: '+10', label: 'Sessões' },
    { value: '14', label: 'Speakers' },
    { value: '20', label: 'Voluntários' },
  ];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % galleryImages.length);
    }
  }, [lightboxIndex, galleryImages]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + galleryImages.length) % galleryImages.length);
    }
  }, [lightboxIndex, galleryImages]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, closeLightbox, nextImage, prevImage]);

  const getVideoContent = (url: string) => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);

    if (match && match[1]) {
        const videoId = match[1];
        if (!isPlaying) {
            return (
                <div className="w-full h-full relative group cursor-pointer bg-black" onClick={() => setIsPlaying(true)}>
                    <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} alt="Video Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-brand-orange rounded-full flex items-center justify-center pl-1 shadow-[0_0_30px_rgba(244,122,32,0.6)] transform group-hover:scale-110 transition-all duration-300">
                            <Play className="w-8 h-8 text-white fill-current" />
                        </div>
                    </div>
                </div>
            );
        }
        return (
            <div className="relative w-full h-full bg-black">
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} title="RSG Lisbon Video" allow="autoplay; encrypted-media" allowFullScreen style={{ border: 0 }} />
            </div>
        );
    } else {
        return (
            <video controls className="w-full h-full object-cover" poster={ASSETS.RECAP_VIDEO_POSTER}>
                <source src={url} type="video/mp4" />
            </video>
        );
    }
  };

  return (
    <Section id="recap" className="bg-white text-brand-darkBlue overflow-hidden relative">

      {/* --- CABEÇALHO --- */}
      <div className="text-center mb-20 relative z-10 flex flex-col items-center">
        <h2 className="text-4xl md:text-6xl font-black mb-10 tracking-tight text-brand-darkBlue">
          Como foi o RSG Lisbon 2025?
        </h2>
        
        <div className="transform -rotate-3 border-4 border-brand-orange rounded-2xl px-8 py-4 md:px-12 md:py-6 shadow-[0_0_40px_rgba(244,122,32,0.15)] inline-block backdrop-blur-sm">
             <p className="text-3xl md:text-5xl font-black text-brand-orange leading-tight uppercase tracking-wide">
                "Foi ÉPICO.<br/>
                Foi INTENSO."
             </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap justify-center gap-12 md:gap-20 mb-20 relative z-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="flex items-center text-5xl md:text-7xl font-black text-brand-darkBlue mb-3 shadow-sm tracking-tighter">
                {stat.value}
            </div>
            <div className="text-sm font-bold tracking-[0.2em] text-brand-blue uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-12 relative z-10">
        {/* Video Player */}
        <div className="w-full max-w-5xl mx-auto mb-8">
             <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-gray-200 ring-4 ring-brand-orange/20">
                {getVideoContent(ASSETS.RECAP_VIDEO)}
            </div>
        </div>

        {/* Gallery */}
        <div className="w-full max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2 text-brand-darkBlue">
                <Star className="text-brand-orange w-6 h-6 fill-current" />
                Melhores Momentos
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                    <div 
                        key={idx} 
                        className="relative rounded-xl overflow-hidden shadow-lg cursor-zoom-in group bg-gray-100 aspect-[4/3]"
                        onClick={() => openLightbox(idx)}
                    >
                        <img 
                            src={img} 
                            alt={`RSG Gallery ${idx}`} 
                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" 
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-brand-blue/0 group-hover:bg-brand-blue/20 transition-colors duration-300"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <ZoomIn className="text-white w-8 h-8 drop-shadow-md" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up" onClick={closeLightbox}>
            <button className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-[70]" onClick={closeLightbox}><X className="w-8 h-8" /></button>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-brand-orange rounded-full transition-all z-[70]" onClick={prevImage}><ChevronLeft className="w-8 h-8" /></button>
            <div className="relative max-w-7xl max-h-[90vh] w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
                <img src={galleryImages[lightboxIndex]} alt="Gallery Fullscreen" className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl" />
            </div>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-brand-orange rounded-full transition-all z-[70]" onClick={nextImage}><ChevronRight className="w-8 h-8" /></button>
        </div>
      )}
    </Section>
  );
};
