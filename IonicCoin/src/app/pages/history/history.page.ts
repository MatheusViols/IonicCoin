import { Component } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
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
  IonCardContent,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, timeOutline, alertCircleOutline } from 'ionicons/icons';
import { StorageService } from '../../services/storage.service';
import { Conversion } from '../../models/conversion.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  imports: [
    CommonModule,
    DatePipe,
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
    IonCardContent,
    IonSpinner
  ]
})
export class HistoryPage implements ViewWillEnter {
  conversions: Conversion[] = [];
  isLoading: boolean = false;
  showEmptyState: boolean = false;

  constructor(private storageService: StorageService) {
    addIcons({ trashOutline, timeOutline, alertCircleOutline });
  }

  /** Chamado pelo Ionic sempre que a página entra em foco (inclusive ao voltar para ela) */
  ionViewWillEnter() {
    this.loadHistory();
  }

  /** Carrega o histórico de conversões do storage persistente */
  async loadHistory() {
    this.isLoading = true;
    try {
      this.conversions = await this.storageService.getHistory();
      this.showEmptyState = this.conversions.length === 0;
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      this.conversions = [];
      this.showEmptyState = true;
    } finally {
      this.isLoading = false;
    }
  }

  /** Limpa todo o histórico de conversões do storage */
  async clearHistory() {
    try {
      await this.storageService.clearHistory();
      this.conversions = [];
      this.showEmptyState = true;
    } catch (err) {
      console.error('Erro ao limpar histórico:', err);
    }
  }
}
