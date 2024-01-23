import { AfterViewInit, Component, NgZone } from '@angular/core';
import { H5P } from "h5p-standalone";

@Component({
  selector: 'app-h5p',
  templateUrl: './h5p.page.html',
})

export class H5PPage implements AfterViewInit {
  h5p: any;
  contents: { name: string; dir: string }[];
  constructor(
    private zone: NgZone,
  ) {
    this.contents = [
      {
        name: 'White Rabbit',
        dir: 'assets/h5p/whiterabbit',
      },
      {
        name: 'Sizzling',
        dir: 'assets/h5p/sizzling',
      },
      {
        name: 'Lab',
        dir: 'assets/h5p/lab',
      }
    ];
  }

  ngAfterViewInit() {
    this.showH5P();
  }

  async showH5P(content?: { name: string; dir: string }) {
    const el = document.getElementById('h5p-container');
    el.innerHTML = '';

    const options: H5P.options = {
      contentJsonPath: content?.dir || '/assets/h5p/sizzling',
      h5pJsonPath: content?.dir || '/assets/h5p/sizzling',
      librariesPath: "/assets/h5p/libraries",
      frameJs: '/assets/h5p/frame.bundle.js',
      frameCss: '/assets/h5p/styles/h5p.css',
    };

    if (this.h5p) {
      this.h5p.destroy();
    }

    return new H5P(el, options);
  }
}