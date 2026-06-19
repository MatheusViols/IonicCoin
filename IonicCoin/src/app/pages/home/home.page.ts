import { Component, OnInit } from '@angular/core';
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
import { cashOutline, swapHorizontalOutline, cloudDoneOutline } from 'ionicons/icons';
import { ExchangeRateService } from '../../services/exchange-rate.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
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
  constructor(private exchangeRateService: ExchangeRateService) {
    addIcons({ cashOutline, swapHorizontalOutline, cloudDoneOutline });
  }

  ngOnInit() {
    console.log('Testing ExchangeRateService...');
    this.exchangeRateService.getExchangeRates('USD').subscribe({
      next: (response) => {
        console.log('API Response Success:', response);
      },
      error: (error) => {
        console.error('API Response Error:', error);
      }
    });
  }
}
