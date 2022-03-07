import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'v3';
  appPages = [
    {
      title: 'Home',
      url: '/app/home',
      icon: 'home'
    },
    {
      title: 'Events',
      url: '/app/events',
      icon: 'event'
    },
    {
      title: 'Reviews',
      url: '/app/reviews',
      icon: 'reviews'
    },
    {
      title: 'Messages',
      url: '/app/messages',
      icon: 'messages'
    },
    {
      title: 'Settings',
      url: '/app/settings',
      icon: 'cog',
    },
    {
      title: 'My Experiences',
      url: '/app/experiences',
      icon: 'experiences'
    }
  ];
}
