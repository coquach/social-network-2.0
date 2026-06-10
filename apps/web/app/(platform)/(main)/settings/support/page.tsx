'use client';

import { 
  HelpCircle, 
  Book, 
  Mail, 
  Phone, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Star, 
  Headset,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SupportItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  meta?: string;
  href?: string;
}

interface SupportSection {
  id: string;
  heading: string;
  items: SupportItem[];
}

export default function SupportPage() {
  const router = useRouter();

  const supportSections: SupportSection[] = [
    {
      id: 'self-help',
      heading: 'Tài liệu',
      items: [
        {
          id: 'faq',
          title: 'Câu hỏi thường gặp',
          description: 'Xem câu trả lời cho các vấn đề phổ biến nhất của người dùng.',
          icon: <HelpCircle className="h-5 w-5 text-sky-500" />,
          href: '#',
        },
        {
          id: 'guide',
          title: 'Hướng dẫn sử dụng',
          description: 'Tìm hiểu cách sử dụng ứng dụng một cách tối ưu và hiệu quả.',
          icon: <Book className="h-5 w-5 text-indigo-500" />,
          href: '#',
        },
      ],
    },
    {
      id: 'contact',
      heading: 'Liên hệ hỗ trợ',
      items: [
        {
          id: 'email',
          title: 'Email hỗ trợ',
          description: 'Gửi thắc mắc hoặc vấn đề kỹ thuật. Chúng tôi phản hồi trong vòng 24 giờ làm việc.',
          icon: <Mail className="h-5 w-5 text-emerald-500" />,
          meta: 'support@sentimeta.com',
          href: 'mailto:support@sentimeta.com',
        },
        {
          id: 'hotline',
          title: 'Hotline',
          description: 'Hỗ trợ trực tiếp qua điện thoại trong giờ làm việc.',
          icon: <Phone className="h-5 w-5 text-orange-500" />,
          meta: '1800 1234 · T2–T6, 8:00–17:00',
          href: 'tel:18001234',
        },
        {
          id: 'chat',
          title: 'Chat trực tuyến',
          description: 'Trò chuyện với nhân viên hỗ trợ theo thời gian thực.',
          icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
          meta: 'Mở cửa 8:00–22:00 hàng ngày',
          href: '#',
        },
      ],
    },
    {
      id: 'feedback',
      heading: 'Góp ý & Phản hồi',
      items: [
        {
          id: 'bug',
          title: 'Báo cáo lỗi',
          description: 'Phát hiện lỗi trong ứng dụng? Hãy báo cho chúng tôi.',
          icon: <Bug className="h-5 w-5 text-rose-500" />,
          meta: 'bugs@sentimeta.com',
          href: '#',
        },
        {
          id: 'suggest',
          title: 'Đề xuất tính năng',
          description: 'Chia sẻ ý tưởng để giúp chúng tôi cải thiện sản phẩm tốt hơn.',
          icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
          meta: 'feedback@sentimeta.com',
          href: '#',
        },
        {
          id: 'rate',
          title: 'Đánh giá ứng dụng',
          description: 'Nếu hài lòng, hãy để lại đánh giá để ủng hộ đội ngũ phát triển.',
          icon: <Star className="h-5 w-5 text-yellow-500" />,
          href: '#',
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 pb-20">
      <div className="mb-8 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()} 
          className="md:hidden shrink-0"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Headset className="h-6 w-6 text-blue-500" />
          Trợ giúp & Hỗ trợ
        </h1>
      </div>

      <div className="space-y-8">
        {/* Intro banner */}
        <div className="rounded-3xl bg-blue-50 border border-blue-100 p-6 flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Headset className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-blue-900 mb-1">
              Chúng tôi luôn sẵn sàng hỗ trợ
            </h2>
            <p className="text-sm leading-relaxed text-blue-700/80">
              Tìm câu trả lời trong tài liệu hoặc liên hệ trực tiếp với đội ngũ của chúng tôi bất cứ lúc nào.
            </p>
          </div>
        </div>

        {/* Sections */}
        {supportSections.map((section) => (
          <section key={section.id} className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
              {section.heading}
            </h2>
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {section.items.map((item, index) => (
                <Link
                  key={item.id}
                  href={item.href || '#'}
                  className={cn(
                    "flex items-start gap-4 p-4 transition hover:bg-slate-50",
                    index !== section.items.length - 1 && "border-b border-slate-100"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 mt-0.5">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{item.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                    {item.meta && (
                      <p className="text-sm font-medium text-slate-400 mt-2">{item.meta}</p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 shrink-0 self-center" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
