"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnalytics } from "./analytics-provider";

export function AnalyticsControls() {
  const {
    dimension,
    periodPreset,
    customPeriod,
    setDimension,
    setPeriodPreset,
    setCustomPeriod,
  } = useAnalytics();
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-lg border">
      {/* Dimension Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          表示単位
        </label>
        <Select value={dimension} onValueChange={setDimension}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="表示単位を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">日別</SelectItem>
            <SelectItem value="week">週別</SelectItem>
            <SelectItem value="month">月別</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Period Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          期間
        </label>
        <Select value={periodPreset} onValueChange={setPeriodPreset}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="期間を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">過去7日</SelectItem>
            <SelectItem value="30d">過去30日</SelectItem>
            <SelectItem value="90d">過去90日</SelectItem>
            <SelectItem value="365d">過去1年</SelectItem>
            <SelectItem value="custom">カスタム期間</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Period Inputs - Only shown when custom is selected */}
      {periodPreset === "custom" && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              開始日
            </label>
            <input
              type="date"
              value={customPeriod?.from?.toISOString().split('T')[0] || ''}
              onChange={(e) => {
                const newFrom = new Date(e.target.value);
                if (customPeriod?.to) {
                  setCustomPeriod({ from: newFrom, to: customPeriod.to });
                } else {
                  setCustomPeriod({ from: newFrom, to: new Date() });
                }
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              終了日
            </label>
            <input
              type="date"
              value={customPeriod?.to?.toISOString().split('T')[0] || ''}
              onChange={(e) => {
                const newTo = new Date(e.target.value);
                if (customPeriod?.from) {
                  setCustomPeriod({ from: customPeriod.from, to: newTo });
                } else {
                  const from = new Date();
                  from.setDate(from.getDate() - 30);
                  setCustomPeriod({ from, to: newTo });
                }
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}