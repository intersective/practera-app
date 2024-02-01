import { AfterViewInit, Component, NgZone } from '@angular/core';
import { H5P as H5PStandalone } from "h5p-standalone";
import * as H5P from 'h5p-standalone';
import { catchError } from 'rxjs/operators';
import { RequestService } from 'request';

declare global {
  interface Window { H5P: any; }
}

@Component({
  selector: 'app-h5p',
  templateUrl: './h5p.page.html',
})

export class H5PPage implements AfterViewInit {
  protected s3url = './assets/h5p';
  h5p: any;
  contents: { name: string; dir: string }[];
  constructor(
    private request: RequestService,
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
    this.request.get('http://localhost:3000/api/h5p').pipe(
      catchError((err) => {
        console.error(err);
        return err;
      })
    ).subscribe((res: {
      result: any[]
    }) => {
      console.log('h5p', res.result);
      const contents = res.result.map((content) => {
        return {
          name: content.name,
          dir: `${this.s3url}${content.dir}`,
        };
      });
      this.contents.push(...contents);
    });
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

    const options: H5PStandalone.options = {
      h5pJsonPath: content?.dir || `${this.s3url}/sizzling`,
      contentJsonPath: content?.dir || `${this.s3url}/sizzling`,
      librariesPath: "/assets/h5p/libraries",
      frameJs: '/assets/h5p/frame.bundle.js',
      frameCss: '/assets/h5p/styles/h5p.css',
      assetsRequestFetchOptions: {
        // mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'include',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        }
      },
    };

    try {
      const data = await new H5PStandalone(el, options);

      // const iframe = el.getElementsByTagName(`iframe#h5p-iframe-${data}`);


      if (window.H5P) {
        window.H5P.externalDispatcher.on('xAPI', (event) => {
          console.log('xAPI event:', event);
        });
      }

    } catch (error) {
      console.error(error);
    }
  }
}