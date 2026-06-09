import { ChatBox } from './_components/chat-box';
import { Navbar } from './_components/navbar';
import { CallOverlay } from '@/components/chat/call-overlay';

const GeneralLayout = ({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) => {
  return (
    <div className="relative h-screen bg-slate-50 overflow-hidden">
      {/* Header landmark - contains navigation */}
      <header>
        <Navbar />
      </header>

      {/* Main content landmark - skip link target */}
      <main 
        id="main-content"
        aria-label="Nội dung chính"
        className="mt-16 h-[calc(100vh-4rem)] w-full overflow-y-auto app-scroll"
      >
        {children}
      </main>

      {modal}

      {/* Complementary landmark - chat feature */}
      <aside aria-label="Tin nhắn">
        <ChatBox />
      </aside>

      <CallOverlay />
    </div>
  );
};

export default GeneralLayout;
