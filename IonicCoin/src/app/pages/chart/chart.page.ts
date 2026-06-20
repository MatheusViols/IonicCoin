import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonList,
  NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  swapHorizontalOutline,
  trendingUpOutline,
  trendingDownOutline,
  arrowUpCircleOutline,
  arrowDownCircleOutline,
  analyticsOutline,
  alertCircleOutline
} from 'ionicons/icons';

import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

import { ChartService } from '../../services/chart.service';
import { ChartDataPoint } from '../../models/chart-data.model';

// Registar os módulos necessários do Chart.js
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  Filler
);

@Component({
  selector: 'app-chart',
  templateUrl: './chart.page.html',
  styleUrls: ['./chart.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonBadge,
    IonSegment,
    IonSegmentButton,
    IonSpinner,
    IonList
  ]
})
export class ChartPage implements OnInit, AfterViewInit, OnDestroy {
  // Variáveis controladas pela interface (model binding)
  fromCurrency: string = 'EUR';
  toCurrency: string = 'USD';
  selectedPeriod: string = '7d';

  // Controlo de estado
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  // Métricas calculadas pelo serviço
  metricMax: string = '--';
  metricMin: string = '--';
  metricAvg: string = '--';
  variationPercentage: string = '0.00';
  variationType: 'up' | 'down' = 'up';

  // Histórico recente para a lista
  recentRates: { date: string; value: string; change: number }[] = [];

  // Instância do gráfico Chart.js
  private chartInstance: Chart | null = null;
  private initialLoadDone: boolean = false;

  constructor(
    private navCtrl: NavController,
    private chartService: ChartService
  ) {
    addIcons({
      swapHorizontalOutline,
      trendingUpOutline,
      trendingDownOutline,
      arrowUpCircleOutline,
      arrowDownCircleOutline,
      analyticsOutline,
      alertCircleOutline
    });
  }

  ngOnInit() {
    // Carregamento inicial dos dados
    this.loadChartData();
  }

  ngAfterViewInit() {
    this.initialLoadDone = true;
  }

  ngOnDestroy() {
    this.destroyChart();
  }

  /**
   * Chamado quando o utilizador altera a moeda base ou alvo nos seletores.
   */
  onCurrencyChange() {
    this.loadChartData();
  }

  /**
   * Chamado quando o utilizador altera o período no segmento.
   */
  onPeriodChange() {
    this.loadChartData();
  }

  /**
   * Inverte as moedas de origem e destino.
   */
  swapCurrencies() {
    const temp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = temp;
    this.loadChartData();
  }

  /**
   * Carrega os dados históricos do serviço e atualiza o gráfico e métricas.
   */
  loadChartData() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    // Destruir o gráfico existente antes de recarregar
    this.destroyChart();

    const period = this.selectedPeriod as '7d' | '30d' | '90d' | '1y';

    this.chartService.getHistoricalData(this.fromCurrency, this.toCurrency, period).subscribe({
      next: (data) => {
        // Atualizar métricas
        this.metricMax = data.metricMax.toFixed(4);
        this.metricMin = data.metricMin.toFixed(4);
        this.metricAvg = data.metricAvg.toFixed(4);
        this.variationPercentage = data.variationPercentage;
        this.variationType = data.variationType;

        // Preparar últimos 5 pontos para a lista de taxas recentes
        const lastPoints = data.points.slice(-5).reverse();
        this.recentRates = lastPoints.map(point => ({
          date: this.formatDate(point.date),
          value: point.value.toFixed(4),
          change: point.change
        }));

        // Desativar o loading (o que faz o canvas aparecer no DOM via @if)
        this.isLoading = false;

        // Renderizar o gráfico após um tick para garantir que o canvas está no DOM
        setTimeout(() => {
          this.renderChart(data.points);
        }, 50);
      },
      error: (err) => {
        console.error('[ChartPage] Erro ao carregar dados:', err);
        this.isLoading = false;
        this.hasError = true;
        this.errorMessage = 'Não foi possível obter os dados históricos. Verifique a sua ligação à Internet.';
        this.metricMax = '--';
        this.metricMin = '--';
        this.metricAvg = '--';
        this.variationPercentage = '0.00';
        this.variationType = 'up';
        this.recentRates = [];
      }
    });
  }

  /**
   * Renderiza o gráfico Chart.js com os dados históricos.
   */
  private renderChart(points: ChartDataPoint[]) {
    const canvas = document.getElementById('historicalRatesChart') as HTMLCanvasElement;
    if (!canvas) {
      console.warn('[ChartPage] Canvas não encontrado no DOM');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = points.map(p => this.formatChartLabel(p.date));
    const values = points.map(p => p.value);

    // Determinar cor com base na variação (verde = up, vermelho = down)
    const isPositive = this.variationType === 'up';
    const lineColor = isPositive ? '#2dd36f' : '#eb445a';
    const fillColorStart = isPositive ? 'rgba(45, 211, 111, 0.25)' : 'rgba(235, 68, 90, 0.25)';
    const fillColorEnd = isPositive ? 'rgba(45, 211, 111, 0.02)' : 'rgba(235, 68, 90, 0.02)';

    // Criar gradiente
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, fillColorStart);
    gradient.addColorStop(1, fillColorEnd);

    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${this.fromCurrency}/${this.toCurrency}`,
          data: values,
          borderColor: lineColor,
          backgroundColor: gradient,
          borderWidth: 2.5,
          pointRadius: points.length > 60 ? 0 : 3,
          pointHoverRadius: 6,
          pointBackgroundColor: lineColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: lineColor,
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            titleFont: {
              size: 12,
              weight: 'normal'
            },
            bodyFont: {
              size: 14,
              weight: 'bold'
            },
            callbacks: {
              title: (tooltipItems) => {
                const idx = tooltipItems[0].dataIndex;
                return this.formatDate(points[idx].date);
              },
              label: (tooltipItem) => {
                return `${this.fromCurrency}/${this.toCurrency}: ${(tooltipItem.raw as number).toFixed(4)}`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            grid: {
              display: false
            },
            ticks: {
              maxTicksLimit: 6,
              maxRotation: 0,
              font: {
                size: 10
              },
              color: 'rgba(150, 150, 150, 0.8)'
            }
          },
          y: {
            display: true,
            grid: {
              color: 'rgba(150, 150, 150, 0.1)'
            },
            ticks: {
              maxTicksLimit: 5,
              font: {
                size: 10
              },
              color: 'rgba(150, 150, 150, 0.8)',
              callback: (value) => {
                return (value as number).toFixed(4);
              }
            }
          }
        }
      }
    });
  }

  /**
   * Destrói a instância atual do gráfico Chart.js, se existir.
   */
  private destroyChart() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  /**
   * Formata uma data ISO (YYYY-MM-DD) para formato legível (DD MMM YYYY).
   */
  private formatDate(isoDate: string): string {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const parts = isoDate.split('-');
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    const year = parts[0];
    return `${day} ${month} ${year}`;
  }

  /**
   * Formata as labels do eixo X do gráfico (formato curto).
   */
  private formatChartLabel(isoDate: string): string {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const parts = isoDate.split('-');
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1];
    return `${day} ${month}`;
  }
}
