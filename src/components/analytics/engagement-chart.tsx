"use client";

import { api } from "@/trpc/react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useAnalytics } from "./analytics-provider";

export function EngagementChart() {
  const { getAnalyticsParams } = useAnalytics();
  const analyticsParams = getAnalyticsParams();
  
  const { data: analytics, isLoading, error } = api.threads.getAnalytics.useQuery(analyticsParams);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">チャートを読み込み中...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">データの取得に失敗しました</p>
      </div>
    );
  }

  const chartData = analytics.engagementByDay.map((day, index) => ({
    ...day,
    total: day.likes + day.replies + day.reposts + day.quotes,
    formattedDate: format(new Date(day.date), "M/d", { locale: ja }),
    index, // Add index for consistent spacing
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart 
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="formattedDate"
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 10, dy: 10 }}
          tickFormatter={(value, index) => {
            const totalTicks = chartData.length;
            let showInterval = Math.max(1, Math.floor(totalTicks / 8));
            
            // Adjust interval based on dimension and data size
            if (analyticsParams.dimension === "day" && totalTicks > 30) {
              showInterval = Math.max(1, Math.floor(totalTicks / 6));
            } else if (analyticsParams.dimension === "month") {
              showInterval = 1; // Show all months
            }
            
            if (index % showInterval === 0 || index === totalTicks - 1) {
              const date = new Date(value);
              
              // Format based on dimension
              if (analyticsParams.dimension === "day") {
                return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
              } else if (analyticsParams.dimension === "week") {
                return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
              } else if (analyticsParams.dimension === "month") {
                return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' });
              }
              
              return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
            }
            return "";
          }}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        日付
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {label}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        総エンゲージメント
                      </span>
                      <span className="font-bold">{data.total}</span>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>いいね: {data.likes}</div>
                    <div>リプライ: {data.replies}</div>
                    <div>リポスト: {data.reposts}</div>
                    <div>引用: {data.quotes}</div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorTotal)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}