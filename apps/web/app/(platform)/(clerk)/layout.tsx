import { Logo } from "./_components/logo";


const ClerkLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      <Logo />
      {children}
    </div>
  )
};

export default ClerkLayout



