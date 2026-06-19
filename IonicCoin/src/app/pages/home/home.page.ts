import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExchangeRateService } from '../../services/exchange-rate.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage implements OnInit {
  constructor(private exchangeRateService: ExchangeRateService) {}

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
