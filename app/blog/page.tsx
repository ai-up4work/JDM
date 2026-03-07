'use client';

import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const blogPosts = [
  {
    id: 1,
    title: '5 Must-Have Fashion Trends for 2024',
    excerpt:
      'Discover the hottest fashion trends that are taking over in 2024. From bold colors to timeless classics, here is everything you need to know.',
    image:
      'https://images.unsplash.com/photo-1595777707802-41d4cf4acf17?w=600',
    author: 'Fashion Team',
    date: 'March 1, 2024',
    category: 'Fashion',
  },
  {
    id: 2,
    title: 'Complete Guide to Summer Wardrobes',
    excerpt:
      'Planning your summer outfits? Learn how to build the perfect summer wardrobe with essential pieces that work together.',
    image:
      'https://images.unsplash.com/photo-1495949203519-e21cc028cb29?w=600',
    author: 'Style Expert',
    date: 'February 28, 2024',
    category: 'Styling',
  },
  {
    id: 3,
    title: 'How to Care for Your Luxury Clothing',
    excerpt:
      'Protect your investment with proper care. Learn the best practices to keep your luxury items looking brand new for years.',
    image:
      'https://images.unsplash.com/photo-1516217343007-6b3b63d5f423?w=600',
    author: 'Care Expert',
    date: 'February 25, 2024',
    category: 'Tips',
  },
  {
    id: 4,
    title: 'Traditional Fashion: Modern Twist',
    excerpt:
      'Explore how traditional fashion elements are being reimagined for the modern world while maintaining cultural authenticity.',
    image:
      'https://images.unsplash.com/photo-1609319058177-d3d98fc2e8b7?w=600',
    author: 'Cultural Editor',
    date: 'February 22, 2024',
    category: 'Culture',
  },
  {
    id: 5,
    title: 'Shopping Smart: Finding Quality at Great Prices',
    excerpt:
      'Master the art of smart shopping. Tips and tricks to find the best deals without compromising on quality.',
    image:
      'https://images.unsplash.com/photo-1573886749341-61530f63ad8d?w=600',
    author: 'Budget Expert',
    date: 'February 20, 2024',
    category: 'Shopping',
  },
  {
    id: 6,
    title: 'Sustainable Fashion Choices',
    excerpt:
      'Join the sustainable fashion movement. Learn how to make eco-friendly choices without sacrificing style.',
    image:
      'https://images.unsplash.com/photo-1552062407-d351475ecc82?w=600',
    author: 'Sustainability Team',
    date: 'February 18, 2024',
    category: 'Sustainability',
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Fashion & Style Blog</h1>
        <p className="text-lg text-muted-foreground">
          Tips, trends, and expert advice on fashion and style
        </p>
      </div>

      {/* Featured Post */}
      <div className="mb-12">
        <Link href={`/blog/${blogPosts[0].id}`} className="group block">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-secondary rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            {/* Image */}
            <div className="h-80 md:h-full overflow-hidden">
              <img
                src={blogPosts[0].image}
                alt={blogPosts[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col justify-center">
              <p className="text-sm font-semibold text-primary mb-2">
                FEATURED
              </p>
              <h2 className="text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                {blogPosts[0].title}
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                {blogPosts[0].excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1">
                  <User size={16} />
                  {blogPosts[0].author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {blogPosts[0].date}
                </span>
              </div>
              <Button className="w-fit bg-primary hover:bg-primary/90 text-primary-foreground">
                Read More <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </Link>
      </div>

      {/* Other Posts */}
      <div>
        <h3 className="text-2xl font-bold mb-8">Latest Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="group">
              <div className="bg-white rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                {/* Image */}
                <div className="h-40 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs font-semibold text-primary mb-2">
                    {post.category}
                  </p>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {post.date}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <section className="mt-16 bg-gradient-to-r from-primary to-secondary rounded-lg p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Subscribe to Our Newsletter</h3>
        <p className="mb-6">Get the latest fashion tips and exclusive offers delivered to your inbox</p>
        <div className="flex flex-col md:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded text-foreground"
          />
          <Button className="bg-white text-primary hover:bg-white/90">
            Subscribe
          </Button>
        </div>
      </section>
    </div>
  );
}
