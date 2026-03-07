import { SearchSidebar } from './_components/search-sidebar';

export default async function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid grid-cols-4 w-full h-full">
      <div className="w-1/4 h-full p-2 overflow-y-hidden fixed gap-y-2 hidden sm:flex sm:flex-col justify-start">
        <div className="flex items-center justify-between px-2">
          <p className="text-2xl font-bold text-sky-500 p-2 md:pr-2">
            Tìm kiếm
          </p>
        </div>

        <hr />
        <SearchSidebar />
      </div>
      <main className="col-span-4 sm:col-start-2 lg:col-start-2 sm:col-span-3 lg:col-span-3 px-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
