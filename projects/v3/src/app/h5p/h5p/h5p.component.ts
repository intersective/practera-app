import { Component } from '@angular/core';
import { H5P } from "h5p-standalone";

@Component({
  selector: 'app-h5p',
  templateUrl: './h5p.component.html',
  styleUrls: ['./h5p.component.scss']
})
export class H5pComponent {
  constructor() {
    H5P.embed(
      "https://h5p.org/h5p/embed/166164",
      document.getElementById("h5p-container"),
      {
        h5pJsonPath: "assets/h5p/libraries",
        frameJs: "assets/h5p/frame.bundle.js",
        frameCss: "assets/h5p/styles/h5p.css",
        contentUserData: {
          "1": {
            "state": "",
            "progress": 0,
            "time": 0,
            "completed": false
          }
        },
        contentLanguage: "en",
        exportUrl: "https://h5p.org/h5p/embed/166164/export",
        displayOptions: {
          frame: true,
          export: false,
          embed: false,
          icon: false,
          exportFilename: "H5P Sample",
        },
        siteUrl: "https://h5p.org",
      }
    );
  }
}