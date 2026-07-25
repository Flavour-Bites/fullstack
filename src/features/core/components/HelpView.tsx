import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Package, MessageSquare, ChevronDown, Clock, ShieldCheck } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    question: "How far in advance should I order my custom cake?",
    answer: "For bespoke custom designs, we highly recommend placing your order at least 2 weeks in advance. Since every cake is handcrafted by Yodit and our slots are extremely limited, popular dates fill up quickly."
  },
  {
    question: "Do you offer delivery or is it pick-up only?",
    answer: "We offer both! You can select delivery (within Addis Ababa) or studio pick-up during your request. Note that complex multi-tier cakes may require special transport arrangements."
  },
  {
    question: "How do deposits and payments work?",
    answer: "A 50% non-refundable deposit is required to secure your booking date on our calendar. The remaining balance is due exactly 3 days before your scheduled pickup/delivery."
  },
  {
    question: "Can I request allergy-friendly options?",
    answer: "While we take the utmost care with our ingredients, our kitchen handles dairy, gluten, and nuts. Therefore, we cannot guarantee a 100% allergen-free environment for severe allergies."
  }
];

export default function HelpView() {
  usePageTitle("Help & FAQ");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="bg-stone-900 text-white py-20 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[30vw] h-[30vw] rounded-full border border-white/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-mono block mb-2 font-semibold">Support</span>
          <h1 className="text-4xl sm:text-5xl font-serif text-white mb-6">How can we help you?</h1>
          <div className="h-[2px] w-12 bg-lux-gold mx-auto mb-6" />
          <p className="text-stone-400 text-sm font-light max-w-lg mx-auto font-sans leading-relaxed">
            From commissioning your dream cake to tracking your order, find all the information you need to make your celebration memorable.
          </p>
        </div>
      </section>

      {/* Guide Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Ordering */}
          <div className="bg-white dark:bg-stone-950 p-8 border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-xs group hover:border-lux-gold/40 transition-colors">
            <div className="w-12 h-12 bg-stone-100 dark:bg-stone-900 rounded-sm flex items-center justify-center text-lux-gold mb-6 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-stone-900 dark:text-stone-100 mb-3">How to Order</h3>
            <p className="text-stone-500 dark:text-stone-400 font-light text-sm mb-6 leading-relaxed">
              Browse our Gallery to find a design you love, or go straight to the Request page to detail your custom vision. Yodit will review and provide a personalized quote.
            </p>
            <Link to="/request" className="text-lux-gold text-xs font-mono uppercase tracking-wider font-semibold hover:text-stone-900 dark:hover:text-white transition-colors">
              Start a Request &rarr;
            </Link>
          </div>

          {/* Card 2: Tracking */}
          <div className="bg-white dark:bg-stone-950 p-8 border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-xs group hover:border-lux-gold/40 transition-colors">
            <div className="w-12 h-12 bg-stone-100 dark:bg-stone-900 rounded-sm flex items-center justify-center text-lux-gold mb-6 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-stone-900 dark:text-stone-100 mb-3">Track Your Order</h3>
            <p className="text-stone-500 dark:text-stone-400 font-light text-sm mb-6 leading-relaxed">
              Login securely via Telegram to view real-time updates on your cake's progress. You can check invoices, update details, and view baker notes directly from your dashboard.
            </p>
            <Link to="/auth" className="text-lux-gold text-xs font-mono uppercase tracking-wider font-semibold hover:text-stone-900 dark:hover:text-white transition-colors">
              Login to Portal &rarr;
            </Link>
          </div>

          {/* Card 3: Contact */}
          <div className="bg-white dark:bg-stone-950 p-8 border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-xs group hover:border-lux-gold/40 transition-colors">
            <div className="w-12 h-12 bg-stone-100 dark:bg-stone-900 rounded-sm flex items-center justify-center text-lux-gold mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-xl text-stone-900 dark:text-stone-100 mb-3">Still Need Help?</h3>
            <p className="text-stone-500 dark:text-stone-400 font-light text-sm mb-6 leading-relaxed">
              Have a specific question not covered here? Feel free to reach out to us directly through our contact form or chat with our AI assistant for instant answers.
            </p>
            <Link to="/contact" className="text-lux-gold text-xs font-mono uppercase tracking-wider font-semibold hover:text-stone-900 dark:hover:text-white transition-colors">
              Contact Us &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <HelpCircle className="w-8 h-8 text-lux-gold mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-serif text-stone-900 dark:text-stone-100">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx} 
              className="border border-stone-200/80 dark:border-stone-800 rounded-sm bg-white dark:bg-stone-950 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span className="font-serif text-lg text-stone-900 dark:text-stone-200 pr-8">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180 text-lux-gold' : ''}`} 
                />
              </button>
              
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-5 pt-0 text-stone-500 dark:text-stone-400 font-light text-sm leading-relaxed border-t border-stone-100 dark:border-stone-850 mt-2">
                      <div className="pt-3 flex gap-3 items-start">
                        <ShieldCheck className="w-4 h-4 text-lux-gold mt-0.5 shrink-0" />
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
