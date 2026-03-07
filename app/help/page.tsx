'use client';

import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const helpCategories = [
  {
    title: 'Shipping & Delivery',
    faqs: [
      {
        question: 'How long does shipping take?',
        answer:
          'Orders typically arrive within 3-5 business days. Express shipping is available for next-day delivery on select items.',
      },
      {
        question: 'Do you offer international shipping?',
        answer:
          'Yes, we ship to multiple countries in South Asia. Shipping costs and delivery times vary by location.',
      },
      {
        question: 'Can I track my order?',
        answer:
          'Yes, you will receive a tracking number via email once your order ships. You can use it to track your package in real-time.',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    faqs: [
      {
        question: 'What is your return policy?',
        answer:
          'We offer a 7-day easy return policy. Items must be in original condition with tags attached.',
      },
      {
        question: 'How do I initiate a return?',
        answer:
          'You can request a return through your order page. A free return label will be provided.',
      },
      {
        question: 'When will I get my refund?',
        answer:
          'Refunds are processed within 5-7 business days after we receive your returned item.',
      },
    ],
  },
  {
    title: 'Payment',
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept credit cards, debit cards, and mobile payments. All transactions are secure and encrypted.',
      },
      {
        question: 'Is my payment secure?',
        answer:
          'Yes, we use industry-standard SSL encryption and PCI DSS compliance to protect your payment information.',
      },
      {
        question: 'Can I save my payment information?',
        answer:
          'Yes, you can securely save your payment details for faster checkout in future purchases.',
      },
    ],
  },
  {
    title: 'Account & Orders',
    faqs: [
      {
        question: 'How do I create an account?',
        answer:
          'Click on "Sign Up" at the top of the page and enter your email and password. You can also use your social media accounts.',
      },
      {
        question: 'Can I modify my order after placing it?',
        answer:
          'You can modify your order within 24 hours of placing it. Contact our support team for assistance.',
      },
      {
        question: 'How do I delete my account?',
        answer:
          'You can request account deletion from your profile settings. Your data will be permanently removed after 30 days.',
      },
    ],
  },
  {
    title: 'Products',
    faqs: [
      {
        question: 'Are all products authentic?',
        answer:
          '100% Yes! We guarantee that all products sold on JDM are authentic. If you receive a counterfeit item, we will provide a full refund.',
      },
      {
        question: 'How can I know the right size?',
        answer:
          'Each product page has a detailed size guide. You can also contact the seller directly for sizing advice.',
      },
      {
        question: 'What if the product is defective?',
        answer:
          'Contact our support team with photos within 7 days of delivery. We will arrange a replacement or refund.',
      },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const filteredCategories = helpCategories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.faqs.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Find answers to your questions
        </p>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-3 text-muted-foreground" size={20} />
          <Input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-3 text-lg"
          />
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-8">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div key={category.title}>
              <h2 className="text-2xl font-bold mb-4">{category.title}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {category.faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`${category.title}-${index}`}
                    className="border border-border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:text-primary transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              No results found for "{searchQuery}"
            </p>
            <p className="text-muted-foreground">
              Try searching with different keywords or browse categories above
            </p>
          </div>
        )}
      </div>

      {/* Contact Support */}
      <div className="mt-16 bg-secondary rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
        <p className="text-muted-foreground mb-6">
          Our customer support team is here to assist you
        </p>
        <div className="space-y-2">
          <p>
            Email: <span className="font-semibold">support@JDM.lk</span>
          </p>
          <p>
            Phone: <span className="font-semibold">+94 (0) 123-456789</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Available Monday - Friday, 9 AM - 6 PM PKT
          </p>
        </div>
      </div>
    </div>
  );
}
