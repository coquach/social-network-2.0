/**
 * App Configuration
 * Thông tin cơ bản về app
 */

export const appConfig = {
  name: 'Sentimeta',
  description: 'A social network powered by emotion analysis',
  keywwords: ['social network', 'emotion analysis', 'AI-powered', 'community'],
  openGraph: {
    title: 'Sentimeta - A social network powered by emotion analysis',
    description:
      'Join Sentimeta to share your thoughts and feelings, connect with others, and explore a new way of social networking.',
    url: 'https://sentimeta.vercel.app',
    siteName: 'Sentimeta',
    images: [
      {
        url: '/124599.jpg',
        width: 1200,
        height: 630,
        alt: 'Sentimeta - A social network powered by emotion analysis',
      },
    ],
  },
  lcoale: 'vi-VN',
  phoneNumber: '+84 123 456 789',
  email: '',
  type: 'website',
  countryName: 'Vietnam',
} as const;
