"use client";

import * as React from "react";
import { RotateCcw, Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContentEntryFilter } from "@/lib/actions/admin/content-entry-action";
import { TargetType } from "@repo/shared";
import { ContentStatus } from "@/models/admin/contentEntryDTO";

const targetLabels: Record<TargetType, string> = {
  [TargetType.POST]: "Bài viết",
  [TargetType.SHARE]: "Chia sẻ",
  [TargetType.COMMENT]: "Bình luận",
};

const statusLabels: Record<ContentStatus, string> = {
  [ContentStatus.ACTIVE]: "Đang hiển thị",
  [ContentStatus.VIOLATED]: "Vi phạm",
};

type ContentToolbarProps = {
  filter: ContentEntryFilter;
  onFilterChange: (changes: Partial<ContentEntryFilter>) => void;
  onReset: () => void;
  loading?: boolean;
};

function toDateInputValue(d?: Date | string | null) {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function ContentToolbar({
  filter,
  onFilterChange,
  onReset,
  loading,
}: ContentToolbarProps) {
  const [keyword, setKeyword] = React.useState(filter.query ?? "");

  React.useEffect(() => {
    const next = filter.query ?? "";
    setKeyword((prev) => (prev === next ? prev : next));
  }, [filter.query]);

  const debouncedSearch = useDebouncedCallback(
    (text: string) => {
      onFilterChange({
        query: text.trim() || undefined,
        page: 1,
      });
    },
    300,
    { maxWait: 800 },
  );

  const handleReset = () => {
    setKeyword("");
    onReset();
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Tìm kiếm nội dung
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={keyword}
              onChange={(e) => {
                const val = e.target.value;
                setKeyword(val);
                debouncedSearch(val);
              }}
              placeholder="Nội dung, từ khóa..."
              className="border-sky-100 pl-9 focus-visible:ring-sky-200"
            />
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Loại nội dung
          </div>
          <Select
            value={filter.targetType ?? TargetType.POST}
            onValueChange={(value) =>
              onFilterChange({
                targetType: value === "all" ? undefined : (value as TargetType),
                page: 1,
              })
            }
          >
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(targetLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Trạng thái
          </div>
          <Select
            value={filter.status ?? "all"}
            onValueChange={(value) =>
              onFilterChange({
                status: value === "all" ? undefined : (value as ContentStatus),
                page: 1,
              })
            }
          >
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Ngày tạo
          </div>
          <Input
            type="date"
            value={toDateInputValue(filter.createAt as any)}
            onChange={(e) => {
              const val = e.target.value;
              onFilterChange({
                createAt: val ? new Date(val) : undefined,
                page: 1,
              });
            }}
            className="border-sky-100 focus-visible:ring-sky-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:justify-end">
        <Button
          variant="outline"
          className="border-sky-200 text-slate-700 hover:bg-sky-50"
          onClick={handleReset}
          disabled={loading}
        >
          <RotateCcw className="mr-1 h-4 w-4" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
