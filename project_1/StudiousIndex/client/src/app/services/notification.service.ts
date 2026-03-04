import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  relatedId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notification`;

  constructor(private http: HttpClient) { }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-read/${id}`, {});
  }

  showBrowserNotification(title: string, message: string) {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, { body: message });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body: message });
        }
      });
    }
  }
}
