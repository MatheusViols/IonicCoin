import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonicModule, 
  NavController 
} from '@ionic/angular';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.page.html',
  styleUrls: ['./chart.page.scss'],
  standalone: true,
  imports: [
    IonicModule, 
    CommonModule, 
    FormsModule
  ]
})
export class ChartPage implements OnInit {
  // Variáveis controladas pela interface (model binding)
  fromCurrency: string = 'EUR';
  toCurrency: string = 'USD';
  selectedPeriod: string = '7d';
  
  // Controlo de estado do carregamento do gráfico
  isLoading: boolean = false;

  // Métricas fictícias para renderização visual
  metricMax: string = '1.0945';
  metricMin: string = '1.0812';
  metricAvg: string = '1.0878';
  variationPercentage: string = '+1.23';
  variationType: 'up' | 'down' = 'up';

  // Histórico recente fictício para preenchimento da lista
  recentRates = [
    { date: '19 Jun 2026', value: '1.0924', change: 0.15 },
    { date: '18 Jun 2026', value: '1.0908', change: 0.32 },
    { date: '17 Jun 2026', value: '1.0873', change: -0.12 },
    { date: '16 Jun 2026', value: '1.0886', change: 0.45 },
    { date: '15 Jun 2026', value: '1.0837', change: -0.23 }
  ];

  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    this.simulateLoading();
  }

  // Apenas para controlo do estado visual e animações de entrada
  simulateLoading() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1500); // Exibe o esqueleto animado por 1.5s
  }

  swapCurrencies() {
    const temp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = temp;
    this.simulateLoading();
  }
}
