import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thông báo',
  description: 'Cập nhật thông báo mới nhất.',
};

const NoticationsLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="relative overflow-hidden bg-gray-50 p-6">
      <div className="container lg:px-20 xl:px-80  mx-auto">{children}</div>
    </div>
  );
};

export default NoticationsLayout;
