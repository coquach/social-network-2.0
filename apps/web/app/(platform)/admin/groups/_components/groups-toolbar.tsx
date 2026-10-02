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
import {
  AdminGroupQuery,
  GroupMemberRange,
} from "@/lib/actions/admin/admin-group-action";
import { GroupStatus } from "@repo/shared";

type GroupsToolbarProps = {
  filter: AdminGroupQuery;
  onFilterChange: (changes: Partial<AdminGroupQuery>) => void;
  onReset: () => void;
  loading?: boolean;
};

export function GroupsToolbar({
  filter,
  onFilterChange,
  onReset,
  loading,
}: GroupsToolbarProps) {
  const [name, setName] = React.useState(filter.name ?? "");

  React.useEffect(() => {
    const next = filter.name ?? "";
    setName((prev) => (prev === next ? prev : next));
  }, [filter.name]);

  const debouncedSearch = useDebouncedCallback(
    (text: string) => {
      onFilterChange({
        name: text.trim() || undefined,
        page: 1,
      });
    },
    300,
    { maxWait: 800 },
  );

  const handleReset = () => {
    setName("");
    onReset();
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Tìm kiếm nhóm
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                debouncedSearch(val);
              }}
              placeholder="Tên nhóm..."
              className="border-sky-100 pl-9 focus-visible:ring-sky-200"
            />
          </div>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Trạng thái
          </div>
          <Select
            value={filter.status ?? "all"}
            onValueChange={(val) =>
              onFilterChange({
                status: val === "all" ? undefined : (val as GroupStatus),
                page: 1,
              })
            }
          >
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={GroupStatus.ACTIVE}>Hoạt động</SelectItem>
              <SelectItem value={GroupStatus.INACTIVE}>Tạm dừng</SelectItem>
              <SelectItem value={GroupStatus.BANNED}>Bị hạn chế</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-slate-500">
            Số lượng thành viên
          </div>
          <Select
            value={filter.memberRange ?? "all"}
            onValueChange={(val) =>
              onFilterChange({
                memberRange:
                  val === "all" ? undefined : (val as GroupMemberRange),
                page: 1,
              })
            }
          >
            <SelectTrigger className="border-sky-100 focus:ring-sky-200">
              <SelectValue placeholder="Chọn phạm vi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={GroupMemberRange.LT_100}>Dưới 100</SelectItem>
              <SelectItem value={GroupMemberRange.BETWEEN_100_1000}>
                100 - 1000
              </SelectItem>
              <SelectItem value={GroupMemberRange.GT_1000}>
                Trên 1000
              </SelectItem>
            </SelectContent>
          </Select>
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
