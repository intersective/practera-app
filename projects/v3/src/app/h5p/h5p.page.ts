import { AfterViewInit, Component, NgZone } from '@angular/core';
import { H5P } from "h5p-standalone";
import { catchError } from 'rxjs/operators';

const JSON_CONTENT = {
  "embedTypes": [
    "iframe"
  ],
  "language": "en",
  "defaultLanguage": "en",
  "license": "U",
  "extraTitle": "Lab & Sample Collection",
  "title": "Lab & Sample Collection",
  "mainLibrary": "H5P.InteractiveVideo",
  "preloadedDependencies": [
    {
      "machineName": "H5P.SingleChoiceSet",
      "majorVersion": 1,
      "minorVersion": 11
    },
    {
      "machineName": "FontAwesome",
      "majorVersion": 4,
      "minorVersion": 5
    },
    {
      "machineName": "H5P.JoubelUI",
      "majorVersion": 1,
      "minorVersion": 3
    },
    {
      "machineName": "H5P.Transition",
      "majorVersion": 1,
      "minorVersion": 0
    },
    {
      "machineName": "H5P.FontIcons",
      "majorVersion": 1,
      "minorVersion": 0
    },
    {
      "machineName": "H5P.SoundJS",
      "majorVersion": 1,
      "minorVersion": 0
    },
    {
      "machineName": "H5P.Question",
      "majorVersion": 1,
      "minorVersion": 5
    },
    {
      "machineName": "H5P.TrueFalse",
      "majorVersion": 1,
      "minorVersion": 8
    },
    {
      "machineName": "H5P.Summary",
      "majorVersion": 1,
      "minorVersion": 10
    },
    {
      "machineName": "jQuery.ui",
      "majorVersion": 1,
      "minorVersion": 10
    },
    {
      "machineName": "H5P.Video",
      "majorVersion": 1,
      "minorVersion": 6
    },
    {
      "machineName": "H5P.DragNBar",
      "majorVersion": 1,
      "minorVersion": 5
    },
    {
      "machineName": "H5P.DragNDrop",
      "majorVersion": 1,
      "minorVersion": 1
    },
    {
      "machineName": "H5P.DragNResize",
      "majorVersion": 1,
      "minorVersion": 2
    },
    {
      "machineName": "H5P.InteractiveVideo",
      "majorVersion": 1,
      "minorVersion": 26
    }
  ]
};

@Component({
  selector: 'app-h5p',
  templateUrl: './h5p.page.html',
})

export class H5PPage implements AfterViewInit {
  protected s3url = '';
  h5p: any;
  contents: { name: string; dir: string }[];
  constructor(
    private zone: NgZone,
  ) {
    this.contents = [
      {
        name: 'White Rabbit',
        dir: `${this.s3url}/whiterabbit`,
        // dir: 'assets/h5p/whiterabbit',
      },
      {
        name: 'Sizzling',
        dir: `${this.s3url}/sizzling`,
        // dir: 'assets/h5p/sizzling',
      },
      {
        name: 'Lab',
        dir: `${this.s3url}/lab`,
        // dir: 'assets/h5p/lab',
      }
    ];
  }

  ngAfterViewInit() {
    this.showH5P();
  }

  async loadH5P123() {
    const fileurl = `${this.s3url}/sizzling/h5p.json`;
    const fetchthis = fetch(fileurl, {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-GB,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,zh-TW;q=0.6,id;q=0.5,ms;q=0.4",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-site": "cross-site",
        "Access-Control-Allow-Origin": "*"
      },
      "referrer": "http://localhost:4200/",
      "body": null,
      "method": "GET",
      "mode": "no-cors",
      "credentials": "include"
    });

    const requestOptions: any = {
      method: 'GET',
      redirect: 'follow'
    };

    const fetchThat = () =>  fetch(fileurl, requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
    return fetchThat()
    .then(response => {
      return response;
    }).then(data => {
      console.log('asd::', data);
      return data;
    }).catch(error => {
      console.error(error);
    });
  }

  async showH5P(content?: { name: string; dir: string }) {
    const el = document.getElementById('h5p-container');
    el.innerHTML = '';

    const options: H5P.options = {
      h5pJsonPath: content?.dir || 'https://app-sschaw.s3.ap-southeast-1.amazonaws.com/sizzling',
      contentJsonPath: content?.dir || 'https://app-sschaw.s3.ap-southeast-1.amazonaws.com/sizzling',
      librariesPath: "/assets/h5p/libraries",
      frameJs: '/assets/h5p/frame.bundle.js',
      frameCss: '/assets/h5p/styles/h5p.css',
      assetsRequestFetchOptions: {
        mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      },
    };

    if (this.h5p) {
      this.h5p.destroy();
    }

    try {
      const aha = await this.loadH5P123();
      const data = new H5P(el, options);
      console.log(aha);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }
}