import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonIcon, 
  IonCard, 
  IonCardHeader, 
  IonCardSubtitle, 
  IonCardTitle, 
  IonCardContent, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonSelect, 
  IonSelectOption, 
  IonButton, 
  IonBadge 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cashOutline, swapHorizontalOutline, cloudDoneOutline, cloudOfflineOutline } from 'ionicons/icons';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import { CurrencyService } from '../../services/currency.service';
import { Currency } from '../../models/currency.model';
import { Conversion } from '../../models/conversion.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    FormsModule,
    DecimalPipe,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonIcon, 
    IonCard, 
    IonCardHeader, 
    IonCardSubtitle, 
    IonCardTitle, 
    IonCardContent, 
    IonItem, 
    IonLabel, 
    IonInput, 
    IonSelect, 
    IonSelectOption, 
    IonButton, 
    IonBadge
  ],
})
export class HomePage implements OnInit {
  // Lista de moedas disponíveis nos seletores
  currencies: Currency[] = [];

  // Moedas selecionadas (padrões: USD → BRL)
  fromCurrency: string = 'USD';
  toCurrency: string = 'BRL';

  // Valor digitado pelo usuário e resultado calculado
  amount: number | null = null;
  result: number | null = null;

  // Taxa atual e mapa completo de taxas da API
  currentRate: number | null = null;
  conversionRates: { [key: string]: number } = {};

  // Estados de UI
  isLoading: boolean = false;
  isOffline: boolean = false;
  errorMessage: string | null = null;
  lastUpdated: string | null = null;

  constructor(
    private exchangeRateService: ExchangeRateService,
    private currencyService: CurrencyService
  ) {
    addIcons({ cashOutline, swapHorizontalOutline, cloudDoneOutline, cloudOfflineOutline });
  }

  ngOnInit() {
    this.currencies = this.currencyService.getCurrencies();
    this.loadRates(this.fromCurrency);
  }

  /** Busca as taxas de câmbio para a moeda base informada */
  loadRates(baseCode: string) {
    this.isLoading = true;
    this.errorMessage = null;

    this.exchangeRateService.getExchangeRates(baseCode).subscribe({
      next: (response) => {
        this.conversionRates = response.conversion_rates || {};
        this.lastUpdated = response.time_last_update_utc;
        this.isLoading = false;
        this.isOffline = false;
        this.calculate();
      },
      error: (error) => {
        this.isLoading = false;
        this.isOffline = true;
        this.errorMessage = error.message;
        console.error('Erro ao carregar taxas:', error);
      }
    });
  }

  /** Calcula o resultado da conversão localmente, sem nova chamada à API */
  calculate() {
    if (this.amount !== null && this.amount > 0 && this.conversionRates[this.toCurrency]) {
      this.currentRate = this.conversionRates[this.toCurrency];
      this.result = this.amount * this.currentRate;
      this.saveToHistory();
    } else {
      this.result = null;
      this.currentRate = this.conversionRates[this.toCurrency] ?? null;
    }
  }

  /** Trata a mudança no campo de valor */
  onAmountChange(event: CustomEvent) {
    const value = event.detail.value;
    this.amount = value !== '' && value !== null ? parseFloat(value) : null;
    this.calculate();
  }

  /** Trata a mudança na moeda de origem — recarrega as taxas */
  onFromCurrencyChange() {
    this.loadRates(this.fromCurrency);
  }

  /** Trata a mudança na moeda de destino — recalcula com as taxas já carregadas */
  onToCurrencyChange() {
    this.calculate();
  }

  /** Inverte as moedas de origem e destino e recarrega as taxas */
  swapCurrencies() {
    const temp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = temp;
    this.loadRates(this.fromCurrency);
  }

  /** Salva a conversão atual no histórico (StorageService será integrado na Etapa 4) */
  private saveToHistory() {
    if (this.amount === null || this.result === null || this.currentRate === null) return;

    const conversion: Conversion = {
      id: Date.now().toString(),
      fromCurrency: this.fromCurrency,
      toCurrency: this.toCurrency,
      amount: this.amount,
      result: this.result,
      rate: this.currentRate,
      timestamp: Date.now()
    };

    // TODO: this.storageService.saveConversion(conversion);
    console.log('Conversão registrada (aguardando StorageService):', conversion);
  }
}
