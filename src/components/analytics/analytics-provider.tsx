"use client";

import { createContext, useContext, useState } from "react";

type Dimension = "day" | "week" | "month";
type PeriodPreset = "7d" | "30d" | "90d" | "365d" | "custom";

interface AnalyticsState {
  dimension: Dimension;
  periodPreset: PeriodPreset;
  customPeriod?: {
    from: Date;
    to: Date;
  };
}

interface AnalyticsContextType extends AnalyticsState {
  setDimension: (dimension: Dimension) => void;
  setPeriodPreset: (preset: PeriodPreset) => void;
  setCustomPeriod: (period: { from: Date; to: Date }) => void;
  getAnalyticsParams: () => {
    dimension: Dimension;
    period: {
      from?: Date;
      to?: Date;
      days?: number;
    };
  };
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

function getDaysFromPreset(preset: PeriodPreset): number {
  switch (preset) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    case "365d": return 365;
    default: return 365;
  }
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AnalyticsState>({
    dimension: "week",
    periodPreset: "365d",
  });

  const setDimension = (dimension: Dimension) => {
    setState(prev => ({ ...prev, dimension }));
  };

  const setPeriodPreset = (periodPreset: PeriodPreset) => {
    setState(prev => ({ ...prev, periodPreset }));
  };

  const setCustomPeriod = (customPeriod: { from: Date; to: Date }) => {
    setState(prev => ({ ...prev, customPeriod }));
  };

  const getAnalyticsParams = () => {
    if (state.periodPreset === "custom" && state.customPeriod) {
      return {
        dimension: state.dimension,
        period: {
          from: state.customPeriod.from,
          to: state.customPeriod.to,
        },
      };
    }

    return {
      dimension: state.dimension,
      period: {
        days: getDaysFromPreset(state.periodPreset),
      },
    };
  };

  return (
    <AnalyticsContext.Provider
      value={{
        ...state,
        setDimension,
        setPeriodPreset,
        setCustomPeriod,
        getAnalyticsParams,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}