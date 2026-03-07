import { MarkReadProvider } from "@/contexts/mark-read-context";
import { ConversationList } from "./_components/conversation-list";


export default async function ConversationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full">
      <ConversationList />
      <MarkReadProvider>
        {children}
      </MarkReadProvider>
    </div>
  );
}