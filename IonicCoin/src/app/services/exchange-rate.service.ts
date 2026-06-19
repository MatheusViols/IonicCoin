import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ExchangeRateResponse } from '../models/currency.model';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {

  constructor(private http: HttpClient) {}

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
      catchError(this.handleError)
    );
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
