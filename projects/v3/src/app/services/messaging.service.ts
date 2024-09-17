import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  currentToken: string | null = null;

  constructor(private afMessaging: AngularFireMessaging) { }

  requestPermission() {
    this.afMessaging.requestToken.pipe(take(1)).subscribe(
      (token) => {
        // eslint-disable-next-line no-console
        console.log('Permission granted! Save the token:', token);
        this.currentToken = token;
        // TODO: Send the token to your server
      },
      (error) => {
        console.error('Permission denied:', error);
      }
    );
  }

  listenForMessages() {
    this.afMessaging.messages.subscribe((message) => {
      // eslint-disable-next-line no-console
      console.log('Message received:', message);
      // TODO: Handle the message as needed
    });
  }
}
