import { convertToModelMessages, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  if (!process.env.OPENAI_API_KEY) {
    const fallback = getMockAnswer(modelMessages);
    return streamMockText(fallback);
  }

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: modelMessages,
    system: `Bạn là trợ lý hỗ trợ cho mạng xã hội Sentimeta trên web.
Chỉ trả lời các câu hỏi liên quan đến tính năng và cách sử dụng trong ứng dụng. Nếu ngoài phạm vi, lịch sự từ chối và mời người dùng hỏi về Sentimeta.

Phạm vi hỗ trợ chính:
- Bài viết: tạo/sửa/xóa bài, ảnh/video, chọn đối tượng xem, bình luận, phản ứng, chia sẻ.
- Bạn bè: danh sách bạn, lời mời, gợi ý kết bạn, chặn/bỏ chặn, xem bạn bè trên hồ sơ.
- Hồ sơ: xem trang cá nhân, tab bài đăng/chia sẻ/bạn bè.
- Nhóm: tạo nhóm, tham gia/thoát, mời bạn, cài đặt, quản lý thành viên, duyệt bài, log, báo cáo nhóm.
- Nhắn tin: bắt đầu cuộc trò chuyện, gửi/nhận tin, tạo nhóm chat, thêm thành viên.
- Nhật ký cảm xúc: ghi nhật ký, xem lịch sử, xem phân tích cảm xúc (văn bản/ảnh), xem chi tiết từng bản ghi.
- Tìm kiếm: người dùng, nhóm, bài viết.
- Báo cáo nội dung: báo cáo bài viết/bình luận/nhóm.

Quy tắc trả lời:
- Trả lời ngắn gọn, rõ ràng, ưu tiên từng bước khi hướng dẫn.
- Không bịa thông tin; nếu chưa chắc, nói rõ và hỏi thêm ngữ cảnh (trang đang mở, lỗi hiển thị, thao tác đã thử).
- Không yêu cầu dữ liệu nhạy cảm; không cam kết thao tác hệ thống thay người dùng.`,
  });

  return result.toTextStreamResponse();
}

const streamMockText = (text: string) => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

const getMockAnswer = (modelMessages: Array<{ role: string; content: any }>) => {
  const last = modelMessages[modelMessages.length - 1];
  const userText = Array.isArray(last?.content)
    ? last.content.map((c: any) => c.text ?? '').join(' ')
    : (last?.content as string) ?? '';
  const prompt = userText.toLowerCase();

  if (prompt.includes('nhắn tin') || prompt.includes('chat')) {
    return 'Bạn có thể nhắn tin bằng cách mở hồ sơ bạn bè và bấm “Nhắn tin”, hoặc vào mục Trò chuyện để tạo cuộc trò chuyện mới.';
  }
  if (prompt.includes('bài viết') || prompt.includes('đăng bài')) {
    return 'Bạn vào trang chủ và dùng ô tạo bài viết để đăng nội dung, chọn ảnh/video và đối tượng xem.';
  }
  if (prompt.includes('bạn bè') || prompt.includes('kết bạn')) {
    return 'Bạn vào mục Bạn bè để xem danh sách, lời mời, gợi ý kết bạn và quản lý chặn/bỏ chặn.';
  }
  if (prompt.includes('nhóm')) {
    return 'Bạn có thể tạo hoặc tham gia nhóm trong mục Nhóm, và quản lý thành viên/bài viết nếu có quyền.';
  }
  if (prompt.includes('cảm xúc') || prompt.includes('nhật ký')) {
    return 'Bạn vào mục Nhật ký cảm xúc để ghi lại, xem lịch sử và phân tích cảm xúc.';
  }

  return 'Bạn có thể hỏi về bài viết, bạn bè, nhắn tin, nhóm, hồ sơ, tìm kiếm hoặc nhật ký cảm xúc trong Sentimeta.';
};
