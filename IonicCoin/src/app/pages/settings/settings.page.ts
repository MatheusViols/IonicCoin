import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
  IonSelect, IonSelectOption, IonToggle, IonLabel, IonIcon, 
  IonButton, IonButtons, IonBackButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { syncOutline, notificationsOutline, refreshOutline } from 'ionicons/icons';
import { StorageService } from '../../services/storage.service';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import { ToastController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonList, IonItem, IonSelect, IonSelectOption, IonToggle, IonLabel, 
    IonIcon, IonButtons, IonBackButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonButton, IonSpinner
  ]
})
export class SettingsPage implements OnInit {
  updateFrequency: string = 'hourly';
  notifications: boolean = false;
  isUpdating: boolean = false;

  constructor(
    private storageService: StorageService,
    private exchangeRateService: ExchangeRateService,
    private toastController: ToastController
  ) {
    addIcons({ syncOutline, notificationsOutline, refreshOutline });
  }

  async ngOnInit() {
    const savedFrequency = await this.storageService.get('update_frequency');
    if (savedFrequency) {
      this.updateFrequency = savedFrequency;
    }
    const savedNotifications = await this.storageService.get('notifications_enabled');
    if (savedNotifications !== null && savedNotifications !== undefined) {
      this.notifications = savedNotifications;
    }
  }

  async onFrequencyChange() {
    await this.storageService.set('update_frequency', this.updateFrequency);
  }

  async onNotificationsChange() {
    await this.storageService.set('notifications_enabled', this.notifications);
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  updateRatesManually() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    // Atualiza as taxas com base na moeda principal do sistema (USD)
    this.exchangeRateService.getExchangeRates('USD').subscribe({
      next: async (response) => {
        this.isUpdating = false;
        await this.showToast('Taxas de câmbio atualizadas com sucesso!', 'success');
      },
      error: async (error) => {
        this.isUpdating = false;
        await this.showToast(`Erro ao atualizar taxas: ${error.message || error}`, 'danger');
      }
    });
  }
}

