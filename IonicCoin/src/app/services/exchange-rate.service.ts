import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ExchangeRateResponse } from '../models/currency.model';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private notificationService: NotificationService
  ) {}

  getExchangeRates(baseCode: string = 'USD'): Observable<ExchangeRateResponse> {
    let url = '';
    
    if (environment.useFallbackApi || !environment.apiKey || environment.apiKey === 'YOUR_API_KEY') {
      url = `${environment.fallbackApiUrl}/${baseCode}`;
    } else {
      url = `${environment.apiBaseUrl}/${environment.apiKey}/latest/${baseCode}`;
    }

    return this.http.get<any>(url).pipe(
      map(response => {
        if (response && response.rates && !response.conversion_rates) {
          response.conversion_rates = response.rates;
        }
        return response as ExchangeRateResponse;
      }),
      tap(response => {
        if (response && response.conversion_rates) {
          this.handleRatesUpdate(baseCode, response);
        }
      }),
      catchError(this.handleError)
    );
  }

  private async handleRatesUpdate(baseCode: string, response: any) {
    try {
      await this.checkRatesVariation(baseCode, response);
    } catch (e) {
      console.error('Erro na verificação de notificações:', e);
    }
    
    try {
      await this.storageService.saveRates(baseCode, response);
      
      // Guardar a taxa diária para o gráfico (histórico progressivo)
      const dateStr = new Date().toISOString().split('T')[0];
      const historyKey = `history_rates_${baseCode}`;
      const history = await this.storageService.get(historyKey) || {};
      
      if (!history[dateStr]) {
        history[dateStr] = {};
      }
      
      // Atualizar o histórico do dia de hoje com as taxas reais
      for (const cur of Object.keys(response.conversion_rates)) {
        history[dateStr][cur] = response.conversion_rates[cur];
      }
      
      await this.storageService.set(historyKey, history);
      
    } catch (err) {
      console.error('Erro ao salvar taxas no Storage:', err);
    }
  }

  private async checkRatesVariation(baseCode: string, newRates: any) {
    const notificationsEnabled = await this.storageService.get('notifications_enabled');
    if (!notificationsEnabled) return;

    const oldRatesData = await this.storageService.getRates(baseCode);
    if (!oldRatesData || !oldRatesData.rates || !oldRatesData.rates.conversion_rates) return;

    const oldRates = oldRatesData.rates.conversion_rates;
    const newRatesMap = newRates.conversion_rates;

    const mainCurrencies = ['BRL', 'EUR', 'GBP'];
    
    for (const currency of mainCurrencies) {
      if (oldRates[currency] && newRatesMap[currency]) {
        const diff = Math.abs(newRatesMap[currency] - oldRates[currency]);
        const percentage = (diff / oldRates[currency]) * 100;

        if (percentage >= 1.0) {
          const trend = newRatesMap[currency] > oldRates[currency] ? 'subiu' : 'desceu';
          this.notificationService.sendLocalNotification(
            'Alerta de Variação Cambial',
            `A taxa do ${currency} em relação ao ${baseCode} ${trend} ${percentage.toFixed(2)}%!`
          );
        }
      }
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro retornado pela API
      if (error.status === 403) {
        errorMessage = 'Acesso negado. Verifique sua chave de API.';
      } else if (error.status === 404) {
        errorMessage = 'Moeda base não suportada ou URL inválida.';
      } else if (error.status === 0) {
        errorMessage = 'Sem conexão com a internet ou erro de CORS.';
      } else {
        errorMessage = `Código do erro: ${error.status}, Mensagem: ${error.message}`;
      }
    }
    
    console.error('ExchangeRateService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
