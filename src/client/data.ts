import {
    FaqItem,
    IngredientSpotlight,
} from "@shared/types";

export const INGREDIENT_SPOTLIGHTS: IngredientSpotlight[] = [
  {
    name: 'Ethiopian Highland Butter',
    origin: 'Arsi Highlands, Ethiopia',
    description: 'Cultured organic butter from grass-fed cows grazing at 2,500m elevation. Its rich golden color and nutty aroma are the foundation of our signature cake texture.',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Madagascar Bourbon Vanilla',
    origin: 'Antalaha, Madagascar',
    description: 'Hand-pollinated, sun-cured vanilla beans with intense floral and creamy notes. Each pod is aged for 12 months before we extract the pure essence.',
    image: 'https://images.unsplash.com/photo-1582819509235-7c2a5a7b85c2?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Ethiopian Coffee',
    origin: 'Yirgacheffe, Ethiopia',
    description: 'Single-origin organic coffee with bright citrus and floral notes, ground fresh and folded into our coffee-infused buttercreams and cake batters.',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Organic Valley Honey',
    origin: 'Tigray, Ethiopia',
    description: 'Pure white honey from Ethiopia\'s ancient church forests. Its delicate sweetness and floral undertones create the most ethereal honey buttercreams.',
    image: 'https://images.unsplash.com/photo-1620218692324-619c5b5f110c?auto=format&fit=crop&q=80&w=400'
  }
];

export const FAQS: FaqItem[] = [
  {
    id: 'faq-01',
    question: 'How far in advance should I place my order?',
    answer: 'We require a minimum of 48 hours notice for all custom cake orders. For complex multi-tiered cakes or wedding cakes, we recommend ordering at least 2-3 weeks in advance to ensure availability and adequate design consultation time.',
    category: 'booking'
  },
  {
    id: 'faq-02',
    question: 'How do I confirm my cake order?',
    answer: 'Once you\'ve submitted your order request, Yodit will review your design specifications and provide a quote. Review, confirm, and we\'ll begin crafting your custom cake. For any questions about the order process, please contact us directly.',
    category: 'ordering'
  },
  {
    id: 'faq-04',
    question: 'Can I cancel or modify my order?',
    answer: 'Orders can be modified up to 48 hours before the scheduled pickup date. Please contact us directly for any cancellation or modification requests, and we will accommodate where possible.',
    category: 'cancellation'
  },
  {
    id: 'faq-05',
    question: 'Do you accommodate dietary restrictions?',
    answer: 'Yes! We offer eggless, dairy-free, and gluten-free options for many of our cake flavors. Please let us know about any dietary requirements during the consultation process so we can adjust our recipes accordingly.',
    category: 'dietary'
  },
  {
    id: 'faq-06',
    question: 'Where are you located?',
    answer: 'Our home studio is located in Garment, Nifas Silk-Lafto, Addis Ababa. We operate by appointment only. Once your order is confirmed, we will share our exact location and pickup instructions.',
    category: 'studio'
  },
  {
    id: 'faq-07',
    question: 'How do I store my cake after pickup?',
    answer: 'Buttercream cakes should be refrigerated and removed 2 hours before serving. Fondant cakes can be stored at room temperature away from direct sunlight. We provide detailed care instructions with every pickup.',
    category: 'care'
  },
  {
    id: 'faq-08',
    question: 'How much does a custom cake cost?',
    answer: 'Our custom cakes are priced based on the number of servings, design complexity, and specific ingredients used. Our single-tier celebration cakes typically start at 2,400 ETB. Please submit a request form with your design ideas for a personalized quote.',
    category: 'pricing'
  }
];