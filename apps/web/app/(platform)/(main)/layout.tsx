import { Navbar } from './_components/navbar';
import { PlatformOverlays } from './_components/platform-overlays';

const GeneralLayout = ({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) => {
  return (
    <div className="relative h-screen bg-background overflow-hidden">
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

      {/* Dynamic client overlays (ChatBox, CallOverlay) */}
      <PlatformOverlays />
    </div>
  );
};

export default GeneralLayout;
