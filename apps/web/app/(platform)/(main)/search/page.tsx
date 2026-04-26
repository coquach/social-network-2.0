import type { Metadata } from 'next';
import { QueryErrorBoundary } from '@/components/query-error-boundary';
import SearchPageClient from './page-client';

export async function generateMetadata({params}:
  {
    params: Promise<{query: string}>;
  }
): Promise<Metadata> {
  const { query } = await params; // Await params to satisfy Next.js type requirements
  if (!query) {
    return {
      title: 'Tìm kiếm',
      description: 'Tìm kiếm bài viết, người dùng và nội dung khác trên Sentimeta.',
      robots: {
        index: false,
        follow: true,
      },
    };
  }
  return {
    title: `Tìm kiếm: ${query}`,
    description: `Kết quả tìm kiếm cho "${query}" trên Sentimeta.`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function SearchPage() {
  return (
    <QueryErrorBoundary>
      <SearchPageClient />
    </QueryErrorBoundary>
  );
}
