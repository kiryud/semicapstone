import { useEffect, useReducer } from "react";
import { appendChartPoint } from "../utils/chartHistory.js";

export function useChartHistory(dashboardData) {
  const [history, addDashboardPoint] = useReducer(appendChartPoint, []);

  useEffect(() => {
    if (!dashboardData) return;
    addDashboardPoint(dashboardData);
  }, [dashboardData]);

  return history;
}
