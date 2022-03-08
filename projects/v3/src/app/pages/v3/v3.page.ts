import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-v3',
  templateUrl: './v3.page.html',
  styleUrls: ['./v3.page.scss'],
})
export class V3Page implements OnInit {
  appPages = [
    {
      title: 'Home',
      url: '/v3/home',
      icon: 'home'
    },
    {
      title: 'Events',
      url: '/v3/events',
      icon: 'event'
    },
    {
      title: 'Reviews',
      url: '/v3/reviews',
      icon: 'reviews'
    },
    {
      title: 'Messages',
      url: '/v3/messages',
      icon: 'messages'
    },
    {
      title: 'Settings',
      url: '/v3/settings',
      icon: 'cog',
    },
    {
      title: 'My Experiences',
      url: '/v3/experiences',
      icon: 'experiences'
    }
  ];
  constructor() { }

  ngOnInit() {
  }

}
