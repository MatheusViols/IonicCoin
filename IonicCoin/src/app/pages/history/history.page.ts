import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonBackButton, 
  IonButton, 
  IonIcon, 
  IonCard, 
  IonCardContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, timeOutline, alertCircleOutline } from 'ionicons/icons';

export interface MockConversion {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  result: number;
  rate: number;
  timestamp: number;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  imports: [
    CommonModule,
    DecimalPipe,
    RouterLink,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButtons, 
    IonBackButton, 
    IonButton, 
    IonIcon, 
    IonCard, 
    IonCardContent
  ]
})
export class HistoryPage {
  // Lista fictícia de conversões mockadas para visualização de layout
  mockConversions: MockConversion[] = [
    {
      id: '1',
      fromCurrency: 'USD',
      toCurrency: 'BRL',
      amount: 100,
      result: 542.50,
      rate: 5.4250,
      timestamp: Date.now() - 600000 // 10 minutos atrás
    },
    {
      id: '2',
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      amount: 50,
      result: 54.12,
      rate: 1.0824,
      timestamp: Date.now() - 3600000 // 1 hora atrás
    },
    {
      id: '3',
      fromCurrency: 'GBP',
      toCurrency: 'BRL',
      amount: 80,
      result: 554.88,
      rate: 6.9360,
      timestamp: Date.now() - 86400000 // 1 dia atrás
    },
    {
      id: '4',
      fromCurrency: 'USD',
      toCurrency: 'ARS',
      amount: 10,
      result: 9050.00,
      rate: 905.0000,
      timestamp: Date.now() - 172800000 // 2 dias atrás
    }
  ];

  // Controle de estado vazio para testes visuais
  showEmptyState: boolean = false;

  constructor() {
    addIcons({ trashOutline, timeOutline, alertCircleOutline });
  }

  // Simula a limpeza do histórico para testar a transição visual
  clearHistory() {
    this.showEmptyState = true;
    this.mockConversions = [];
  }
}
