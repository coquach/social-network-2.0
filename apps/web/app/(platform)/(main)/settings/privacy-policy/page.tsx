'use client';

import { Shield, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface PrivacyItem {
  id: string;
  title: string;
  description: string;
}

interface PrivacySection {
  title: string;
  items: PrivacyItem[];
}

export default function PrivacyPolicyPage() {
  const router = useRouter();

  const privacySections: PrivacySection[] = [
    {
      title: '1. Thu thập thông tin',
      items: [
        {
          id: '1.1',
          title: 'Thông tin bạn cung cấp',
          description:
            'Chúng tôi thu thập thông tin bạn cung cấp khi tạo tài khoản, bao gồm tên, email, ảnh đại diện và các thông tin cá nhân khác.',
        },
        {
          id: '1.2',
          title: 'Nội dung và hoạt động',
          description:
            'Nội dung bạn đăng tải, bình luận, tương tác, thời gian và tần suất sử dụng ứng dụng đều được ghi nhận để cải thiện dịch vụ.',
        },
      ],
    },
    {
      title: '2. Sử dụng thông tin',
      items: [
        {
          id: '2.1',
          title: 'Cá nhân hoá trải nghiệm',
          description:
            'Thông tin của bạn giúp chúng tôi gợi ý kết bạn, hiển thị bài viết phù hợp và tuỳ chỉnh quảng cáo.',
        },
        {
          id: '2.2',
          title: 'Bảo mật và an toàn',
          description:
            'Chúng tôi sử dụng dữ liệu để phát hiện hành vi đáng ngờ, ngăn chặn spam và bảo vệ tài khoản của bạn.',
        },
      ],
    },
    {
      title: '3. Quyền của bạn',
      items: [
        {
          id: '3.1',
          title: 'Kiểm soát dữ liệu',
          description:
            'Bạn có quyền truy cập, chỉnh sửa hoặc xoá thông tin cá nhân của mình bất kỳ lúc nào trong phần cài đặt.',
        },
        {
          id: '3.2',
          title: 'Tuỳ chọn riêng tư',
          description:
            'Bạn có thể quyết định ai được xem bài viết, thông tin cá nhân và danh sách bạn bè của mình.',
        },
      ],
    },
    {
      title: '4. Chia sẻ thông tin',
      items: [
        {
          id: '4.1',
          title: 'Bên thứ ba',
          description:
            'Chúng tôi KHÔNG bán dữ liệu của bạn. Thông tin chỉ được chia sẻ với các đối tác cung cấp dịch vụ dưới sự đồng ý của bạn.',
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
          <Shield className="h-6 w-6 text-sky-500" />
          Chính sách bảo mật
        </h1>
      </div>

      <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed mb-8">
            Chào mừng bạn đến với mạng xã hội Sentimeta. Việc bảo vệ dữ liệu cá nhân của bạn 
            là ưu tiên hàng đầu của chúng tôi. Vui lòng đọc kỹ chính sách dưới đây để hiểu 
            rõ cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
          </p>

          <div className="space-y-8">
            {privacySections.map((section, index) => (
              <section key={index}>
                <h2 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">
                  {section.title}
                </h2>
                <div className="space-y-5 pl-2 mt-4">
                  {section.items.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <h3 className="text-[16px] font-semibold text-slate-700 flex items-start gap-2">
                        <span className="text-sky-500">{item.id}.</span>
                        {item.title}
                      </h3>
                      <p className="text-[15px] text-slate-600 leading-relaxed pl-8">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-xl bg-slate-50 p-6 text-center border border-slate-100">
            <h3 className="font-semibold text-slate-800 mb-2">Liên hệ với chúng tôi</h3>
            <p className="text-slate-600 text-sm">
              Nếu có thắc mắc về quyền riêng tư, hãy gửi email đến{' '}
              <a href="mailto:privacy@sentimeta.com" className="text-sky-600 font-medium hover:underline">
                privacy@sentimeta.com
              </a>{' '}
              để được hỗ trợ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
