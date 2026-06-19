import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, 
  IonSelect, IonSelectOption, IonToggle, IonLabel, IonIcon, 
  IonButton, IonButtons, IonBackButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { syncOutline, notificationsOutline, moonOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,
    IonList, IonItem, IonSelect, IonSelectOption, IonToggle, IonLabel, 
    IonIcon, IonButton, IonButtons, IonBackButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle
  ]
})
export class SettingsPage implements OnInit {
  updateFrequency: string = 'hourly';
  darkMode: boolean = true;
  notifications: boolean = false;

  constructor() {
    addIcons({ syncOutline, notificationsOutline, moonOutline, trashOutline });
  }

  ngOnInit() {
  }

  onFrequencyChange() {
    // Será integrado com o serviço futuramente
  }

  onDarkModeChange() {
    // Será integrado com o serviço futuramente
  }

  onNotificationsChange() {
    // Será integrado com o serviço futuramente
  }

  clearData() {
    // Será integrado com o serviço futuramente
  }
}
