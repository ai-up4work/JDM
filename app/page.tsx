'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { featuredProducts, sellers } from '@/lib/mockData';
import { ProductCard } from '@/components/ProductCard';
import Image from 'next/image';

// ── Data ────────────────────────────────────────────────────────────────────

const heroSlides = [
  { id: 1, title: 'WOMEN', subtitle: 'FESTIVE WEAR',       image: '/hero/hero1.jpg' },
  { id: 2, title: 'MEN',   subtitle: 'PREMIUM COLLECTION', image: '/hero/hero2.jpg' },
  { id: 3, title: 'KIDS',  subtitle: 'SUMMER WEAR',        image: '/hero/hero3.jpg' },
];

const categories = [
  {
    slug: 'casecraft',
    name: 'CaseCraft',
    type: 'custom',
    isNew: true,
    logo: '/store-icon/potrait/case-craft.png',
    bannerStyle: { background: '#1a1a1a' },
    category: 'Phone Cases',
    description: 'Design your own printed phone case — pick your model, upload your photo, preview it live.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Custom print', 'iPhone', 'Samsung'],
    itemCount: 24,
  },
  // {
  //   slug: 'bloom-and-co',
  //   name: 'Bloom & Co.',
  //   type: 'template',
  //   logo: '/store-icon/potrait/bloom-and-co.png',
  //   bannerStyle: { background: '#f5f0e8' },
  //   category: 'Flowers',
  //   description: 'Fresh flower arrangements and bouquets for every occasion, delivered same-day in Colombo.',
  //   shipping: 'Colombo only',
  //   payment: 'COD',
  //   tags: ['Bouquets', 'Gifting', 'Same-day'],
  //   itemCount: 18,
  // },
  {
    slug: 'muizza-fashion',
    name: 'Muizza Fashion',
    type: 'custom',
    isNew: true,
    logo: '/store-icon/potrait/muizza-fashion.png',
    bannerStyle: { background: '#f5f0e8' },
    category: 'Clothing',
    description: 'Trendy and affordable fashion for men and women. From casual wear to formal attire, we have something for everyone.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Fashion', 'Gifting', 'Custom tailoring'],
    itemCount: 18,
  },
  {
    slug: 'scent-lab',
    name: 'Scent Lab',
    type: 'custom',
    isNew: true,
    logo: '/store-icon/potrait/scent-lab.png',
    bannerStyle: { background: '#1b3a2f' },
    category: 'Fragrance',
    description: 'Build your own attar blend — choose base, heart and top notes, name your scent, order it bottled.',
    shipping: 'Ships island-wide',
    payment: 'Bank transfer',
    tags: ['Attar', 'Custom blend', 'Artisan'],
    itemCount: 12,
  },
  {
    slug: 'be-dapper',
    name: 'Be Dapper',
    type: 'template',
    isNew: true,
    logo: '/store-icon/potrait/be-dapper.png',
    bannerStyle: { background: '#0f2027' },
    category: 'Clothing',
    description: 'Minimal streetwear made in Sri Lanka. Small-batch drops, direct from the designer.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Streetwear', 'Unisex', 'Local brand'],
    itemCount: 41,
  },
  {
    slug: 'old-money',
    name: 'Old Money',
    type: 'template',
    isNew: true,
    logo: '/store-icon/potrait/old-money.png',
    bannerStyle: { background: '#0f2027' },
    category: 'Clothing',
    description: 'Minimal streetwear made in Sri Lanka. Small-batch drops, direct from the designer.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Streetwear', 'Unisex', 'Local brand'],
    itemCount: 41,
  },
    {
    slug: 'otaku-clothing',
    name: 'OTAKU CLOTHING SL',
    type: 'template',
    isNew: true,
    logo: '/store-icon/potrait/otaku.png',
    bannerStyle: { background: '#faf5f0' },
    category: 'Clothing',
    description: 'Ethically made, timeless garments for conscious consumers.',
    shipping: 'Ships island-wide',
    payment: 'COD',
    tags: ['Ethical fashion', 'Sustainable materials', 'Made in Sri Lanka'],
    itemCount: 67,
  },
  // {
  //   slug: 'skye-clothing',
  //   name: 'Skye Clothing',
  //   type: 'template',
  //   logo: '/store-icon/potrait/skye-clothing.png',
  //   bannerStyle: { background: '#faf5f0' },
  //   category: 'Handmade',
  //   description: 'Ethically made, timeless garments for conscious consumers.',
  //   shipping: 'Ships island-wide',
  //   payment: 'COD',
  //   tags: ['Ethical fashion', 'Sustainable materials', 'Made in Sri Lanka'],
  //   itemCount: 67,
  // },
  // {
  //   slug: 'chickadee',
  //   name: 'Chickadee',
  //   type: 'template',
  //   logo: '/store-icon/potrait/chickadee.png',
  //   bannerStyle: { background: '#f5ede8' },
  //   category: 'Jewellery',
  //   description: '18K gold plated jewellery — earrings, necklaces, rings, bracelets and more. Water-resistant & tarnish-free.',
  //   shipping: 'Ships island-wide',
  //   payment: 'COD',
  //   tags: ['Gold plated', 'Earrings', 'Necklaces', 'Rings'],
  //   itemCount: 421,
  // },
  // {
  //   slug: 'cherie-lueur',
  //   name: 'Cherie Lueur',
  //   type: 'template',
  //   logo: '/store-icon/potrait/cherie-lueur.png',
  //   bannerStyle: { background: '#f5ede8' },
  //   category: 'Jewellery',
  //   description: '18K gold plated jewellery — earrings, necklaces, rings, bracelets and more. Water-resistant & tarnish-free.',
  //   shipping: 'Ships island-wide',
  //   payment: 'COD',
  //   tags: ['Gold plated', 'Earrings', 'Necklaces', 'Rings'],
  //   itemCount: 421,
  // },
  // {
  //   slug: 'kingdom-of-rings',
  //   name: 'Kingdom of Rings',
  //   type: 'template',
  //   logo: '/store-icon/potrait/kingdom-of-rings.png',
  //   bannerStyle: { background: '#1a1400' },
  //   category: 'Jewellery',
  //   description: "Sri Lanka's most trusted gold plated jewellery store. Chains, bracelets, rings and bridal sets with a 1-year warranty.",
  //   shipping: 'Ships island-wide',
  //   payment: 'COD',
  //   tags: ['Gold plated', 'Chains', 'Bridal', 'Rings'],
  //   itemCount: 36,
  // },
  // {
  //   slug: 'enzayn-ceylon',
  //   name: 'Enzayn Ceylon',
  //   type: 'template',
  //   logo: '/store-icon/potrait/enzayn-ceylon.png',
  //   bannerStyle: { background: '#faf5f0' },
  //   category: 'Handmade',
  //   description: 'Ethically made, timeless garments for conscious consumers.',
  //   shipping: 'Ships island-wide',
  //   payment: 'COD',
  //   tags: ['Ethical fashion', 'Sustainable materials', 'Made in Sri Lanka'],
  //   itemCount: 67,
  // },
  // {
  //   slug: 'giva',
  //   name: 'GIVA',
  //   type: 'template',
  //   isNew: true,
  //   logo: '/store-icon/potrait/giva.png',
  //   bannerStyle: { background: '#1a1400' },
  //   category: 'Jewellery',
  //   description: "Sri Lanka's most trusted gold plated jewellery store. Chains, bracelets, rings and bridal sets with a 1-year warranty.",
  //   shipping: 'Ships island-wide',
  //   payment: 'COD',
  //   tags: ['Gold plated', 'Rose Gold', 'Bridal', 'Rings'],
  //   itemCount: 36,
  // },
  // {
  //   slug: 'buckley-london',
  //   name: 'Buckley London',
  //   type: 'template',
  //   isNew: true,
  //   logo: '/store-icon/potrait/buckley-london.png',
  //   bannerStyle: { background: '#0f172a' },
  //   category: 'Jewellery',
  //   description: "Elegant British-designed jewellery brand known for crystal-studded pieces, timeless bracelets, necklaces, and gift-ready collections.",
  //   shipping: 'Ships island-wide',
  //   payment: 'COD',
  //   tags: ['Crystal', 'Luxury', 'Bracelets', 'Necklaces', 'Gifts'],
  //   itemCount: 28,
  // },
];


const newIn = [
  { collection: "Qalamkar | Chikankari Eid Edit '26",              brand: 'Qalamkar',          image: '/garments/product1.jpeg',  href: '/collections/qalamkar-eid',   discount: null },
  { collection: "Mushq | Astoria Festive Lawn '26",                brand: 'Mushq',             image: '/garments/product2.jpeg',  href: '/collections/mushq-astoria',  discount: null },
  { collection: "Maria B | Luxury Lawn '26",                       brand: 'Maria B',           image: '/garments/product3.jpeg',  href: '/collections/maria-b-luxury', discount: 5    },
  { collection: "Noor By Saadia Asad | Handwork schiffli laserkari-26", brand: 'Noor By Saadia Asad', image: '/garments/product4.jpeg', href: '/collections/noor-saadia', discount: null },
  { collection: "Sana Safinaz | Muzlin Summer '26",                brand: 'Sana Safinaz',      image: '/garments/product5.jpeg',  href: '/collections/sana-muzlin',    discount: null },
  { collection: "Rang-e-Haya | Festive Collection",                brand: 'Rang-e-Haya',       image: '/garments/product6.jpeg',  href: '/collections/rang-e-haya',    discount: 10   },
  { collection: "Gul Ahmed | Summer Lawn '26",                     brand: 'Gul Ahmed',         image: '/garments/product7.jpeg',  href: '/collections/gul-ahmed-lawn', discount: null },
  { collection: "Khaadi | Eid Pret '26",                           brand: 'Khaadi',            image: '/garments/product8.jpeg',  href: '/collections/khaadi-eid',     discount: null },
];

const mostPopular = [
  { name: 'Haseens Official', items: 377, discount: 70, image: '/garments/product1.jpeg',  href: '/brands/haseens-official'  },
  { name: 'Rang-e-Haya',      items: 197, discount: 75, image: '/garments/product2.jpeg',  href: '/brands/rang-e-haya'       },
  { name: 'Aik Pret',         items: 110, discount: 63, image: '/garments/product3.jpeg',  href: '/brands/aik-pret'          },
  { name: 'Diara Couture',    items: 242, discount: 60, image: '/garments/product4.jpeg',  href: '/brands/diara-couture'     },
  { name: 'Sana Safinaz',     items: 320, discount: 55, image: '/garments/product5.jpeg',  href: '/brands/sana-safinaz'      },
  { name: 'Maria B',          items: 289, discount: 65, image: '/garments/product6.jpeg',  href: '/brands/maria-b'           },
  { name: 'Zara Shahjahan',   items: 145, discount: 50, image: '/garments/product7.jpeg',  href: '/brands/zara-shahjahan'    },
  { name: 'Gul Ahmed',        items: 412, discount: 68, image: '/garments/product8.jpeg',  href: '/brands/gul-ahmed'         },
  { name: 'Khaadi',           items: 534, discount: 60, image: '/garments/product9.jpeg',  href: '/brands/khaadi'            },
  { name: 'Limelight',        items: 308, discount: 72, image: '/garments/product10.jpeg', href: '/brands/limelight'         },
  { name: 'Alkaram Studio',   items: 276, discount: 58, image: '/garments/product11.jpeg', href: '/brands/alkaram'           },
  { name: 'Sapphire',         items: 391, discount: 62, image: '/garments/product12.jpeg', href: '/brands/sapphire'          },
  { name: 'Bonanza Satrangi', items: 183, discount: 55, image: '/garments/product13.jpeg', href: '/brands/bonanza-satrangi'  },
  { name: 'Nishat Linen',     items: 224, discount: 67, image: '/garments/product14.jpeg', href: '/brands/nishat-linen'      },
  { name: 'Charcoal',         items: 159, discount: 53, image: '/garments/product15.jpeg', href: '/brands/charcoal'          },
  { name: 'Cross Stitch',     items: 201, discount: 70, image: '/garments/product16.jpeg', href: '/brands/cross-stitch'      },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function NewInCarousel() {
  const [start, setStart] = useState(0);
  const [colCount, setColCount] = useState(4);

  useEffect(() => {
    function update() {
      if (window.innerWidth < 640)       setColCount(1);
      else if (window.innerWidth < 1024) setColCount(2);
      else                               setColCount(4);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const canPrev = start > 0;
  const canNext = start + colCount < newIn.length;

  return (
    <section className="mb-10 sm:mb-16">
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">New In - 2026</h2>
        {/* Arrows: hidden on mobile, visible on sm+ */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStart((s) => Math.max(0, s - 1))}
            disabled={!canPrev}
            className="p-2 rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setStart((s) => Math.min(newIn.length - colCount, s + 1))}
            disabled={!canNext}
            className="p-2 rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Mobile: native horizontal swipe with snap */}
      <div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-3 pb-1">
        {newIn.map((item) => (
          <Link
            key={item.collection}
            href={item.href}
            className="group flex flex-col gap-2 shrink-0 w-[72vw] snap-start"
          >
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={item.image}
                alt={item.collection}
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
              {item.discount && (
                <div className="absolute bottom-3 left-3 z-10">
                  <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Upto {item.discount}% off
                  </span>
                </div>
              )}
            </div>
            <div className="px-0.5">
              <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                {item.collection}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{item.brand}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* sm+: arrow-controlled grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {newIn.slice(start, start + colCount).map((item) => (
          <Link key={item.collection} href={item.href} className="group flex flex-col gap-2 min-w-0">
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
              <Image
                src={item.image}
                alt={item.collection}
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
              {item.discount && (
                <div className="absolute bottom-3 left-3 z-10">
                  <span className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Upto {item.discount}% off
                  </span>
                </div>
              )}
            </div>
            <div className="px-0.5">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                {item.collection}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{item.brand}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Styling Videos ───────────────────────────────────────────────────────────

const stylingVideos = [
  { brand: 'Zoya&Zafar',       price: 28.46, originalPrice: 54.53, discount: 50, image: '/garments/product1.jpeg',  video: 'https://www.w3schools.com/html/mov_bbb.mp4',                                                        thumbnail: '/garments/product1.jpeg'  },
  { brand: 'Silk Leaf',        price: 10.00, originalPrice: 20.00, discount: 50, image: '/garments/product2.jpeg',  video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',                thumbnail: '/garments/product2.jpeg'  },
  { brand: 'Al-Harir Apparel', price: 61.67, originalPrice: 99.00, discount: 38, image: '/garments/product3.jpeg',  video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',              thumbnail: '/garments/product3.jpeg'  },
  { brand: 'Rajdulari',        price: 51.42, originalPrice: 85.00, discount: 40, image: '/garments/product4.jpeg',  video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',             thumbnail: '/garments/product4.jpeg'  },
  { brand: 'Qalamkar',         price: 45.00, originalPrice: 72.00, discount: 38, image: '/garments/product5.jpeg',  video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',            thumbnail: '/garments/product5.jpeg'  },
  { brand: 'Mushq',            price: 33.20, originalPrice: 55.00, discount: 40, image: '/garments/product6.jpeg',  video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',                thumbnail: '/garments/product6.jpeg'  },
  { brand: 'Maria B',          price: 78.90, originalPrice: 120.0, discount: 34, image: '/garments/product7.jpeg',  video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',           thumbnail: '/garments/product7.jpeg'  },
  { brand: 'Sana Safinaz',     price: 42.10, originalPrice: 68.00, discount: 38, image: '/garments/product8.jpeg',  video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', thumbnail: '/garments/product8.jpeg'  },
];

function StylingVideos() {
  const [start, setStart] = useState(0);
  const [activeVideo, setActiveVideo] = useState<typeof stylingVideos[0] | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const [colCount, setColCount] = useState(4);
  useEffect(() => {
    function update() {
      if (window.innerWidth < 640)       setColCount(2);
      else if (window.innerWidth < 1024) setColCount(3);
      else                               setColCount(4);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const canPrev = start > 0;
  const canNext = start + colCount < stylingVideos.length;

  const closeVideo = () => {
    if (videoRef.current) videoRef.current.pause();
    setActiveVideo(null);
  };

  const togglePause = () => {
    if (!videoRef.current) return;
    isPaused ? videoRef.current.play() : videoRef.current.pause();
    setIsPaused((p) => !p);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted((m) => !m);
  };

  // Shared card renderer to avoid duplication
  const VideoCard = ({ item }: { item: typeof stylingVideos[0] }) => (
    <button
      key={item.brand}
      type="button"
      onClick={() => setActiveVideo(item)}
      className="group relative flex flex-col text-left min-w-0 w-full"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
        <Image
          src={item.image}
          alt={item.brand}
          fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl" />
        <div className="absolute top-3 left-3 z-10 bg-white/20 backdrop-blur-sm rounded-full p-2">
          <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M8 5v14l11-7z" /></svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <p className="text-white text-sm font-semibold truncate">{item.brand}</p>
          <p className="text-white text-sm font-medium">$ {item.price.toFixed(2)}</p>
        </div>
      </div>
    </button>
  );

  return (
    <>
      <section className="mb-10 sm:mb-16">
        <div className="flex items-center justify-between mb-5 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Styling Videos</h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/videos" className="text-sm font-medium text-foreground hover:text-primary transition-colors hidden sm:block">
              View All
            </Link>
            {/* Arrows: hidden on mobile */}
            <button
              type="button"
              onClick={() => setStart((s) => Math.max(0, s - 1))}
              disabled={!canPrev}
              className="hidden sm:flex p-2 rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setStart((s) => Math.min(stylingVideos.length - colCount, s + 1))}
              disabled={!canNext}
              className="hidden sm:flex p-2 rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Mobile: native swipe */}
        <div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-3 pb-1">
          {stylingVideos.map((item) => (
            <div key={item.brand} className="shrink-0 w-[48vw] snap-start">
              <VideoCard item={item} />
            </div>
          ))}
        </div>

        {/* sm+: arrow-controlled grid */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {stylingVideos.slice(start, start + colCount).map((item) => (
            <VideoCard key={item.brand} item={item} />
          ))}
        </div>
      </section>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={closeVideo}
        >
          <div
            className="relative flex flex-col bg-black overflow-hidden rounded-2xl w-full"
            style={{ maxWidth: 390, height: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-1 overflow-hidden" onClick={togglePause}>
              <video
                ref={videoRef}
                src={activeVideo.video}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Close button — top right, same circular style as mute */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); closeVideo(); }}
                className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-sm rounded-full p-2 z-10"
              >
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>

              {/* Mute button — just below close */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="absolute top-16 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2 z-10"
              >
                {isMuted ? (
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                  </svg>
                )}
              </button>

              {/* Share button — unchanged */}
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  const shareData = {
                    title: activeVideo.brand,
                    text: `Check out ${activeVideo.brand} — $${activeVideo.price.toFixed(2)}`,
                    url: `${window.location.origin}/shop/${activeVideo.brand.toLowerCase().replace(/\s+/g, '-')}`,
                  };
                  if (navigator.share) {
                    try { await navigator.share(shareData); } catch (_) {}
                  } else {
                    await navigator.clipboard.writeText(shareData.url);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="absolute bottom-28 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2.5 z-10"
              >
                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
              </button>

              {/* Product card — unchanged */}
              <div
                className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  const slug = activeVideo.brand.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                  closeVideo();
                  router.push(`/shop/${slug}`);
                }}
              >
                <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-muted shrink-0">
                  <Image src={activeVideo.thumbnail} alt={activeVideo.brand} fill className="object-cover object-top" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{activeVideo.brand}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">$ {activeVideo.price.toFixed(2)}</span>
                    {activeVideo.originalPrice !== activeVideo.price && (
                      <>
                        <span className="text-xs text-muted-foreground line-through">{activeVideo.originalPrice.toFixed(2)}</span>
                        <span className="text-xs font-semibold text-red-500">-{activeVideo.discount}%</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground shrink-0" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Trending Products ────────────────────────────────────────────────────────

const trendingProductsData = Array.from({ length: 48 }, (_, i) => ({
  id: i + 1,
  name: [
    'Snow-White Khussa', 'ML-AZL-24-DGP-235', 'Zulaikha', 'Embroided Cutwork Tr.',
    'Festive Lawn Set', 'Luxury Pret', 'Summer Kurta', 'Chikankari Suit',
    'Bridal Lehenga', 'Casual Pret', 'Eid Collection', 'Digital Print',
  ][i % 12],
  brand: [
    'Khussa Darbar', 'Malhaar', 'Haseens Official', 'Fozia Khalid',
    'Sana Safinaz', 'Maria B', 'Khaadi', 'Qalamkar',
    'Zara Shahjahan', 'Gul Ahmed', 'Rang-e-Haya', 'Sapphire',
  ][i % 12],
  price: parseFloat((10 + Math.random() * 150).toFixed(2)),
  originalPrice: parseFloat((10 + Math.random() * 200).toFixed(2)),
  discount: [5, 16, 20, 30, 38, 47, 25, 15, 10, 35, 42, 18][i % 12],
  image: `/garments/product${(i % 16) + 1}.jpeg`,
  rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
  reviews: Math.floor(5 + Math.random() * 50),
  express: i % 3 !== 2,
  hasVideo: i % 5 === 0,
  category: ['Women', 'Men', 'Kids', 'Beauty'][i % 4],
  fabric: ['Cotton', 'Silk', 'Lawn', 'Chiffon', 'Linen'][i % 5],
  size: ['XS', 'S', 'M', 'L', 'XL'][i % 5],
  color: ['White', 'Black', 'Green', 'Blue', 'Pink'][i % 5],
}));

const PAGE_SIZE = 8;

type FilterState = {
  category: string;
  sortBy: string;
  inStock: boolean;
  fabric: string;
  price: string;
  size: string;
  color: string;
  brand: string;
};

const FILTER_OPTIONS = {
  category: ['All', 'Women', 'Men', 'Kids', 'Beauty'],
  sortBy: ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Newest', 'Top Rated'],
  fabric: ['All', 'Cotton', 'Silk', 'Lawn', 'Chiffon', 'Linen'],
  price: ['All', 'Under $25', '$25–$75', '$75–$125', 'Over $125'],
  size: ['All', 'XS', 'S', 'M', 'L', 'XL'],
  color: ['All', 'White', 'Black', 'Green', 'Blue', 'Pink'],
  brand: ['All', 'Khussa Darbar', 'Malhaar', 'Haseens Official', 'Fozia Khalid', 'Sana Safinaz', 'Maria B', 'Khaadi', 'Qalamkar'],
};

function FilterDropdown({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const active = value !== 'All' && value !== 'Recommended' && value !== '';
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap
          ${active ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-foreground hover:bg-secondary'}`}
      >
        {active ? value : label}
        <ChevronRight size={14} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-30 bg-background border border-border rounded-xl shadow-lg py-1 min-w-[140px] sm:min-w-[160px]">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors
                ${(value === opt || (opt === 'All' && !value)) ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TrendingProducts() {
  const [filters, setFilters] = useState<FilterState>({
    category: 'All', sortBy: 'Recommended', inStock: false,
    fabric: 'All', price: 'All', size: 'All', color: 'All', brand: 'All',
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const setFilter = (key: keyof FilterState) => (val: string | boolean) =>
    setFilters((f) => ({ ...f, [key]: val }));

  const filtered = trendingProductsData.filter((p) => {
    if (filters.category !== 'All' && p.category !== filters.category) return false;
    if (filters.fabric   !== 'All' && p.fabric   !== filters.fabric)   return false;
    if (filters.size     !== 'All' && p.size     !== filters.size)     return false;
    if (filters.color    !== 'All' && p.color    !== filters.color)    return false;
    if (filters.brand    !== 'All' && p.brand    !== filters.brand)    return false;
    if (filters.price !== 'All') {
      if (filters.price === 'Under $25'   && p.price >= 25)                   return false;
      if (filters.price === '$25–$75'     && (p.price < 25 || p.price > 75))  return false;
      if (filters.price === '$75–$125'    && (p.price < 75 || p.price > 125)) return false;
      if (filters.price === 'Over $125'   && p.price <= 125)                  return false;
    }
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'Price: Low to High') return a.price - b.price;
    if (filters.sortBy === 'Price: High to Low') return b.price - a.price;
    if (filters.sortBy === 'Top Rated')          return b.rating - a.rating;
    return 0;
  });

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  useEffect(() => { setPage(1); }, [filters]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setLoading(true);
        setTimeout(() => { setPage((p) => p + 1); setLoading(false); }, 500);
      }
    }, { threshold: 0.1 });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loading]);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    k !== 'sortBy' && v !== 'All' && v !== false && v !== ''
  ).length;

  return (
    <section className="mb-10 sm:mb-16">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Trending Products</h2>
      </div>

      {/* Filter bar — scrollable, bleeds to edges on mobile */}
      <div className="flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide px-3 sm:mx-0 sm:px-0">
        <FilterDropdown label="Category" options={FILTER_OPTIONS.category} value={filters.category} onChange={setFilter('category')} />

        <button
          type="button"
          className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border transition-colors shrink-0
            ${activeFilterCount > 0 ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:bg-secondary'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
            <circle cx="8"  cy="6"  r="2" fill="currentColor" stroke="none"/>
            <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
            <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
          </svg>
        </button>

        <FilterDropdown label="Sort By" options={FILTER_OPTIONS.sortBy} value={filters.sortBy} onChange={setFilter('sortBy')} />

        <button
          type="button"
          onClick={() => setFilter('inStock')(!filters.inStock)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-border bg-background text-xs sm:text-sm font-medium hover:bg-secondary transition-colors shrink-0"
        >
          In-stock
          <div className={`relative w-8 sm:w-9 h-4 sm:h-5 rounded-full transition-colors ${filters.inStock ? 'bg-green-500' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-3 sm:w-4 h-3 sm:h-4 bg-white rounded-full shadow transition-transform ${filters.inStock ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>

        <FilterDropdown label="Fabric" options={FILTER_OPTIONS.fabric} value={filters.fabric} onChange={setFilter('fabric')} />
        <FilterDropdown label="Price"  options={FILTER_OPTIONS.price}  value={filters.price}  onChange={setFilter('price')}  />
        <FilterDropdown label="Size"   options={FILTER_OPTIONS.size}   value={filters.size}   onChange={setFilter('size')}   />
        <FilterDropdown label="Color"  options={FILTER_OPTIONS.color}  value={filters.color}  onChange={setFilter('color')}  />
        <FilterDropdown label="Brands" options={FILTER_OPTIONS.brand}  value={filters.brand}  onChange={setFilter('brand')}  />

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => setFilters({ category: 'All', sortBy: 'Recommended', inStock: false, fabric: 'All', price: 'All', size: 'All', color: 'All', brand: 'All' })}
            className="px-3 sm:px-4 py-2 rounded-full border border-red-300 text-red-500 text-xs sm:text-sm font-medium hover:bg-red-50 transition-colors shrink-0"
          >
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No products match your filters.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {visible.map((product) => (
            <Link key={product.id} href={`/shop/${product.id}`} className="group flex flex-col gap-2 min-w-0">
              <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    -{product.discount}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                {product.hasVideo && (
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-10 bg-black/50 rounded-full p-1.5">
                    <svg viewBox="0 0 24 24" fill="white" className="w-3 h-3"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between gap-1 sm:gap-2 px-0.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-bold text-foreground">$ {product.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground line-through hidden sm:inline">$ {product.originalPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                    {product.brand} • {product.name}
                  </p>
                  <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-1.5 flex-wrap">
                    {product.express ? (
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-200">
                        ⚡ Express
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-gray-50 text-gray-500 text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border border-gray-200">
                        ➜ 7 Days
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground hidden sm:inline">★ {product.rating} ({product.reviews})</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => e.preventDefault()}
                  className="shrink-0 p-1.5 sm:p-2 rounded-xl border border-border hover:bg-secondary transition-colors mt-0.5 hidden xs:flex"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 mt-3 sm:mt-5">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 min-w-0 animate-pulse">
              <div className="w-full aspect-[3/4] rounded-2xl bg-muted" />
              <div className="px-0.5 flex flex-col gap-1.5">
                <div className="h-4 w-16 rounded bg-muted" />
                <div className="h-3 w-3/4 rounded bg-muted" />
                <div className="h-5 w-20 rounded-full bg-muted mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="mt-8 flex justify-center">
        {!hasMore && visible.length > 0 && (
          <p className="text-sm text-muted-foreground">You've seen all {filtered.length} products</p>
        )}
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="w-full min-w-0 overflow-x-hidden max-w-7xl sm:px-6 lg:px-40 px-4">

      {/* ── Hero Slider ── */}
      <section className="relative h-44 sm:h-64 lg:h-80 overflow-hidden -mx-4 w-[calc(100%+2rem)] rounded-none mt-0 mb-4 sm:mx-0 sm:w-full sm:rounded-3xl sm:my-6">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover object-center"
              priority={index === 0}
            />
          </div>
        ))}
        <button onClick={prevSlide} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full transition-all z-20">
          <ChevronLeft size={18} className="text-black" />
        </button>
        <button onClick={nextSlide} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full transition-all z-20">
          <ChevronRight size={18} className="text-black" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-6' : 'bg-white/50 w-1.5 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto py-2 sm:py-4 min-w-0">

        {/* ── Shop Our Stores ── */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-8 text-foreground">Shop Our famous Stores</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 lg:gap-5 mx-4">
            {categories.map((cat, i) => (
              <Link key={i} href={`/stores/${cat.slug}`} className="group flex flex-col items-center gap-1.5 sm:gap-2 min-w-0">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl sm:rounded-2xl bg-muted">
                  <Image
                    src={cat.logo}
                    alt={cat.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs sm:text-sm font-medium text-foreground text-center leading-tight line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── New In - 2026 ── */}
        <NewInCarousel />

        {/* ── Most Popular ── */}
        <section className="mb-10 sm:mb-16">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Most Popular</h2>
            <Link href="/brands" className="flex items-center text-primary hover:text-primary/80 font-medium text-sm shrink-0">
              View All <ChevronRight size={18} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {mostPopular.map((brand) => (
              <Link key={brand.name} href={brand.href} className="group flex flex-col gap-2 min-w-0">
                <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl sm:rounded-2xl bg-muted">
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-10">
                    <span className="bg-red-500 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">
                      Upto {brand.discount}% off
                    </span>
                  </div>
                </div>
                <div className="px-0.5">
                  <p className="text-sm font-normal text-foreground group-hover:text-primary transition-colors truncate">
                    {brand.name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{brand.items} items</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Styling Videos ── */}
        <StylingVideos />

        {/* ── Trending Products ── */}
        <TrendingProducts />

      </div>
    </div>
  );
}