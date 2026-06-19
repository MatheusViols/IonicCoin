import { Injectable } from '@angular/core';
import { Currency } from '../models/currency.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currencies: Currency[] = [
    { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
    { code: 'USD', name: 'Dólar Americano', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
    { code: 'JPY', name: 'Iene Japonês', symbol: '¥' },
    { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$' },
    { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$' },
    { code: 'CHF', name: 'Franco Suíço', symbol: 'CHF' },
    { code: 'CNY', name: 'Yuan Chinês', symbol: '¥' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
    { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
    { code: 'UYU', name: 'Peso Uruguaio', symbol: '$' },
    { code: 'PYG', name: 'Guarani Paraguaio', symbol: '₲' },
    { code: 'PEN', name: 'Sol Peruano', symbol: 'S/.' },
    { code: 'BOB', name: 'Boliviano', symbol: 'Bs.' }
  ];

  constructor() {}

  getCurrencies(): Currency[] {
    return [...this.currencies];
  }

  getCurrencyByCode(code: string): Currency | undefined {
    return this.currencies.find(c => c.code.toUpperCase() === code.toUpperCase());
  }

  searchCurrencies(query: string): Currency[] {
    if (!query || query.trim() === '') {
      return this.getCurrencies();
    }
    const cleanQuery = query.toLowerCase().trim();
    return this.currencies.filter(c => 
      c.code.toLowerCase().includes(cleanQuery) || 
      c.name.toLowerCase().includes(cleanQuery)
    );
  }
}
