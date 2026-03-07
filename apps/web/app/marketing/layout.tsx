
const MarketingLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="min-h-screen bg-radial-[at_50%_75%] from-sky-100 via-sky-200 ">
      <main>{children}</main>
    </div>
  );
};

export default MarketingLayout;
