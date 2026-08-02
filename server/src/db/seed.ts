import 'dotenv/config';
import { db } from './index.js';
import { services, testimonials, siteSettings } from './schema.js';

async function seed() {
  console.log('🌱 Seeding database...\n');

  // ── Seed Services ──────────────────────────────
  console.log('📦 Inserting services...');
  await db.insert(services).values([
    {
      title: 'Birthday Bash',
      description:
        'Make your birthday unforgettable with our premium theatre experience. Enjoy a private screening room, custom decorations, a booming sound system, and a celebration that truly sparkles from start to finish.',
      features: [
        'Private Theatre Room',
        '2 Hours Duration',
        'Custom Decorations',
        'Premium Sound System',
        'Photo Booth Setup',
        'Complimentary Cake',
      ],
      price: '₹4,999',
      imageUrl: '/assets/images/birthday-placeholder.jpg',
      isActive: true,
      bookingEnabled: true,
      sortOrder: 1,
    },
    {
      title: 'Baby Shower',
      description:
        'Celebrate the arrival of your little one in style. Our baby shower package includes elegant pastel décor, curated photo opportunities, and a magical ambiance that makes the moment truly special.',
      features: [
        'Elegant Pastel Décor',
        '3 Hours Duration',
        'Theme Customization',
        'Background Music',
        'Photo Corner Setup',
        'Welcome Drinks',
      ],
      price: '₹6,999',
      imageUrl: '/assets/images/babyshower-placeholder.jpg',
      isActive: true,
      bookingEnabled: true,
      sortOrder: 2,
    },
  ]);
  console.log('  ✅ 2 services inserted\n');

  // ── Seed Testimonials ──────────────────────────
  console.log('⭐ Inserting testimonials...');
  await db.insert(testimonials).values([
    {
      customerName: 'Priya Sharma',
      review:
        'Absolutely magical experience! The decorations were stunning, and my daughter loved every moment of her birthday celebration. The team went above and beyond.',
      rating: 5,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      customerName: 'Rahul Mehta',
      review:
        'We booked the baby shower package and it was worth every penny. The venue was beautifully set up, and our guests were amazed. Highly recommended!',
      rating: 5,
      isFeatured: true,
      sortOrder: 2,
    },
    {
      customerName: 'Ananya Reddy',
      review:
        'The private theatre experience was incredible. Perfect sound system, great ambiance, and the staff was super helpful. Will definitely come back!',
      rating: 4,
      isFeatured: false,
      sortOrder: 3,
    },
  ]);
  console.log('  ✅ 3 testimonials inserted\n');

  // ── Seed Site Settings ─────────────────────────
  console.log('⚙️  Inserting site settings...');
  await db.insert(siteSettings).values([
    {
      key: 'general',
      value: {
        siteName: 'Spark Celebrations',
        tagline: 'Where Every Moment Sparkles',
        logoUrl: '',
        heroType: 'animated', // 'image' | 'video' | 'animated'
        heroImageUrl: '',
        heroVideoUrl: '',
      },
    },
    {
      key: 'contact',
      value: {
        phone: '+91 9990863647',
        email: 'hello@sparkcelebrations.com',
        address: 'Hyderabad, Telangana, India',
        mapEmbedUrl: '',
      },
    },
    {
      key: 'whatsapp',
      value: {
        number: '919990863647',
        countryCode: '+91',
        messageTemplate:
          'Hello Spark Celebrations,\nI would like to book:\n*{serviceName}*\n\nCustomer Name: {customerName}\nMobile: {mobile}\nDate: {eventDate}\nTime: {preferredTime}\nNotes: {notes}',
      },
    },
    {
      key: 'seo',
      value: {
        metaTitle: 'Spark Celebrations | Premium Party Theatre Booking',
        metaDescription:
          'Book your dream celebration at Spark Celebrations — premium party theatres for birthdays, baby showers, and special events in Hyderabad.',
        keywords:
          'party theatre, birthday party room, baby shower venue, celebrations, events, Hyderabad',
        ogImageUrl: '',
      },
    },
    {
      key: 'footer',
      value: {
        copyright: '© 2026 Spark Celebrations. All rights reserved.',
        socialMedia: {
          instagram: 'https://instagram.com/sparkcelebrations',
          facebook: 'https://facebook.com/sparkcelebrations',
          youtube: '',
          twitter: '',
        },
        quickLinks: [
          { label: 'Home', url: '/' },
          { label: 'Services', url: '/services' },
          { label: 'Gallery', url: '/gallery' },
          { label: 'About', url: '/about' },
          { label: 'Contact', url: '/contact' },
        ],
        policies: [
          { label: 'Privacy Policy', url: '/privacy' },
          { label: 'Terms of Service', url: '/terms' },
          { label: 'Refund Policy', url: '/refund' },
        ],
      },
    },
  ]);
  console.log('  ✅ 5 settings keys inserted\n');

  console.log('🎉 Database seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
