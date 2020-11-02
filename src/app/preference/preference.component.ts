import { Component, OnInit } from '@angular/core';
import { PreferenceService } from '@services/preference.service';

@Component({
  selector: 'app-preference',
  templateUrl: './preference.component.html',
  styleUrls: ['./preference.component.scss']
})
export class PreferenceComponent implements OnInit {

  constructor(
    private preferenceService: PreferenceService
  ) { }

  ngOnInit() {
    this.preferenceService.getPreference().subscribe(res => {
      console.log(res);
    });
  }

}
