import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  IonButtons,
  IonBadge 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cashOutline, swapHorizontalOutline, cloudDoneOutline, cloudOfflineOutline, alertCircleOutline, timeOutline, settingsOutline, trendingUpOutline } from 'ionicons/icons';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import { CurrencyService } from '../../services/currency.service';
import { StorageService } from '../../services/storage.service';
import { Currency } from '../../models/currency.model';
import { Conversion } from '../../models/conversion.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    FormsModule,
    DecimalPipe,
    RouterLink,
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
    IonButtons,
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
    private currencyService: CurrencyService,
    private storageService: StorageService
  ) {
    addIcons({ cashOutline, swapHorizontalOutline, cloudDoneOutline, cloudOfflineOutline, alertCircleOutline, timeOutline, settingsOutline, trendingUpOutline });
  }

  ngOnInit() {
    this.currencies = this.currencyService.getCurrencies();
    this.loadRates(this.fromCurrency);
  }

  /** Busca as taxas de câmbio para a moeda base informada */
  async loadRates(baseCode: string) {
    this.isLoading = true;
    this.errorMessage = null;

    // Lógica de Frequência de Atualização
    const savedFrequency = await this.storageService.get('update_frequency') || 'hourly';
    
    if (savedFrequency === 'manual' || savedFrequency === 'hourly') {
      const cachedData = await this.storageService.getRates(baseCode);
      if (cachedData && cachedData.timestamp) {
        const timeElapsed = Date.now() - cachedData.timestamp;
        
        // Se for manual OU for hourly e passou menos de 1 hora (3600000 ms)
        if (savedFrequency === 'manual' || (savedFrequency === 'hourly' && timeElapsed < 3600000)) {
          const cached = await this.loadFromCache(baseCode);
          if (cached) {
            this.isOffline = !navigator.onLine;
            this.isLoading = false;
            return;
          }
        }
      }
    }

    // Se offline, tenta obter taxas do cache local diretamente
    if (!navigator.onLine) {
      const cached = await this.loadFromCache(baseCode);
      this.isLoading = false;
      if (!cached) {
        this.isOffline = true;
        this.errorMessage = 'Você está offline e não existem taxas salvas no cache para esta moeda.';
        this.conversionRates = {};
        this.result = null;
        this.currentRate = null;
      }
      return;
    }

    this.exchangeRateService.getExchangeRates(baseCode).subscribe({
      next: (response) => {
        this.conversionRates = response.conversion_rates || {};
        this.lastUpdated = response.time_last_update_utc;
        this.isLoading = false;
        this.isOffline = false;
        this.calculate();
      },
      error: async (error) => {
        console.warn('Erro ao carregar taxas online, tentando obter do cache local...', error);
        const cached = await this.loadFromCache(baseCode);
        this.isLoading = false;
        if (!cached) {
          this.isOffline = true;
          this.errorMessage = 'Erro ao conectar à API de câmbio e nenhum cache local disponível.';
          this.conversionRates = {};
          this.result = null;
          this.currentRate = null;
        }
      }
    });
  }

  /** Tenta carregar as taxas salvas localmente no cache */
  private async loadFromCache(baseCode: string): Promise<boolean> {
    try {
      const cachedData = await this.storageService.getRates(baseCode);
      if (cachedData && cachedData.rates && cachedData.rates.conversion_rates) {
        this.conversionRates = cachedData.rates.conversion_rates;
        this.lastUpdated = cachedData.rates.time_last_update_utc;
        this.isOffline = true;
        this.errorMessage = null;
        this.calculate();
        return true;
      }
    } catch (error) {
      console.error('Erro ao ler taxas do cache:', error);
    }
    return false;
  }

  /** Calcula o resultado da conversão localmente, sem nova chamada à API */
  calculate() {
    if (this.amount !== null && this.amount > 0 && this.conversionRates[this.toCurrency]) {
      this.currentRate = this.conversionRates[this.toCurrency];
      this.result = this.amount * this.currentRate;
    } else {
      this.result = null;
      this.currentRate = this.conversionRates[this.toCurrency] ?? null;
    }
  }

  /** Chamado pelo botão "Converter" — único ponto que calcula e grava no histórico */
  onConvert() {
    if (this.amount === null || this.amount <= 0) return;
    this.calculate();
    this.saveToHistory();
  }

  /** Trata a mudança no campo de valor — apenas actualiza amount em memória */
  onAmountChange(event: CustomEvent) {
    const value = event.detail.value;
    this.amount = value !== '' && value !== null ? parseFloat(value) : null;
  }

  /** Trata a mudança na moeda de origem — recarrega as taxas */
  onFromCurrencyChange() {
    this.loadRates(this.fromCurrency);
  }

  /** Trata a mudança na moeda de destino — limpa resultado para forçar novo clique em Converter */
  onToCurrencyChange() {
    this.result = null;
  }

  /** Inverte as moedas de origem e destino, limpa resultado e recarrega as taxas */
  swapCurrencies() {
    const temp = this.fromCurrency;
    this.fromCurrency = this.toCurrency;
    this.toCurrency = temp;
    this.result = null;
    this.loadRates(this.fromCurrency);
  }

  /** Salva a conversão atual no histórico persistente (SQLite/IndexedDB) */
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

    this.storageService.saveConversion(conversion).catch(err => {
      console.error('Erro ao salvar conversão no histórico:', err);
    });
  }
}
