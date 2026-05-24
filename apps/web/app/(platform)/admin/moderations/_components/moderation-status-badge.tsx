import { Badge } from '@/components/ui/badge';

type Props = {
  status?: string;
};

export function ModerationStatusBadge({ status }: Props) {
  if (!status) {
    return (
      <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100">
        Không có
      </Badge>
    );
  }

  if (status === 'PENDING') {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        Đang chờ xử lý
      </Badge>
    );
  }

  if (status === 'APPROVED') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        Đã duyệt
      </Badge>
    );
  }

  if (status === 'REJECTED') {
    return (
      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
        Bị từ chối
      </Badge>
    );
  }

  return (
    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
      Bị từ chối
    </Badge>
  );
}
