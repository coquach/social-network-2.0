'use client';

import { MessageDTO } from '@repo/shared';
import { Reply } from 'lucide-react';
import Image from 'next/image';

export const MessageReply = ({ replyTo }: { replyTo: MessageDTO | null }) => {

  if (!replyTo) return null;
  const attachments = replyTo.attachments ?? [];

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // optionally highlight it briefly
      element.classList.add('animate-pulse');
      setTimeout(() => element.classList.remove('animate-pulse'), 1000);
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs rounded-lg px-2 py-2 mb-1  bg-gray-200 text-gray-600">
      {/* reply icon */}
      <Reply size={18} onClick={() => handleScroll(replyTo._id)}  className='cursor-pointer'/>

      {/* reply content */}
      {replyTo.content ? (
        <p className="wrap-break-word whitespace-pre-line">{replyTo.content}</p>
      ) : attachments.length > 0 ? (
        <div className="flex gap-1">
          {attachments
            .filter((att) => att.mimeType === 'image')
            .slice(0, 1)
            .map((att, i) => (
              <Image
                key={i}
                src={att.url}
                alt={att.fileName || ''}
                width={40}
                height={40}
                loading="lazy"
                className="rounded object-cover opacity-50"
              />
            ))}
        </div>
      ) : (
        <span className="italic text-gray-400">Tin nhắn</span>
      )}
    </div>
  );
};
