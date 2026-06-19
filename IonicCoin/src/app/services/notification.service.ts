import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Platform } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private platform: Platform) {}

  async requestPermission(): Promise<boolean> {
    if (this.platform.is('capacitor') || this.platform.is('hybrid')) {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    }
    // Web fallback, assumes permission granted or uses browser Notification API if needed
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return 'Notification' in window ? Notification.permission === 'granted' : true;
  }

  async sendLocalNotification(title: string, body: string) {
    const isGranted = await this.requestPermission();
    if (!isGranted) return;

    if (this.platform.is('capacitor') || this.platform.is('hybrid')) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            extra: null
          }
        ]
      });
    } else {
      // Web Fallback
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      } else {
        console.log(`[Notificação Web] ${title}: ${body}`);
      }
    }
  }
}
