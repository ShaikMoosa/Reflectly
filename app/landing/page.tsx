import { HeroParallax } from './components/hero-parallax';
import { CardHoverEffect } from './components/card-hover-effect';
import { TestimonialCards } from './components/testimonial-cards';
import { PricingCards } from './components/pricing-cards';
import { FAQAccordion } from './components/faq-accordion';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section id="hero">
        <HeroParallax />
      </section>
      
      {/* Features Section */}
      <section id="features">
        <CardHoverEffect />
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials">
        <TestimonialCards />
      </section>
      
      {/* Pricing Section */}
      <section id="pricing">
        <PricingCards />
      </section>
      
      {/* FAQ Section */}
      <section id="faq">
        <FAQAccordion />
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Start Transcribing Your Videos Today
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Join thousands of content creators, educators, and professionals who trust Reflectly for their video transcription needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/sign-up" 
              className="px-8 py-4 rounded-full bg-white text-blue-600 font-medium text-lg hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </a>
            <a 
              href="#pricing" 
              className="px-8 py-4 rounded-full bg-transparent border-2 border-white/80 hover:bg-white/10 font-medium text-lg transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 