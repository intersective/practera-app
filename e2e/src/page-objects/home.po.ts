import { browser, $, $$, Key, ExpectedConditions } from 'protractor';
import { AppPage } from './app.po';

export class HomePage extends AppPage {
  parent = $('app-overview-routing');


}
