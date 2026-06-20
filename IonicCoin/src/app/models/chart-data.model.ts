/** Um ponto de dados diário do gráfico */
export interface ChartDataPoint {
  date: string;         // ISO 8601: "2026-06-19"
  value: number;        // Taxa de câmbio no dia
  change: number;       // Variação percentual em relação ao dia anterior
}

/** Resposta da Frankfurter API para séries históricas */
export interface HistoricalRatesResponse {
  amount: number;
  base: string;
  start_date: string;
  end_date: string;
  rates: {
    [date: string]: { [currency: string]: number }
  };
}

/** Dados históricos completos para um par de moedas */
export interface ChartSeriesData {
  fromCurrency: string;
  toCurrency: string;
  period: '7d' | '30d' | '90d' | '1y';
  points: ChartDataPoint[];
  metricMax: number;
  metricMin: number;
  metricAvg: number;
  variationPercentage: string;
  variationType: 'up' | 'down';
  cachedAt: number;     // Timestamp para controlo de cache (ms)
}
