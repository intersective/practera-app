import { ElementRef, Renderer2 } from "@angular/core";
import { BrowserStorageService } from "@v3/app/services/storage.service";
import { BackgroundImageDirective } from "./background-image.directive";

describe('BackgroundImageDirective', () => {
  let directive: BackgroundImageDirective;
  let el: ElementRef;
  let renderer: Renderer2;
  let storageService: BrowserStorageService;

  beforeEach(() => {
    el = new ElementRef(document.createElement('div'));
    renderer = jasmine.createSpyObj('Renderer2', ['addClass', 'removeClass', 'setStyle']);
    storageService = jasmine.createSpyObj('BrowserStorageService', ['get', 'set']);
    directive = new BackgroundImageDirective(el, renderer, storageService);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should initialize ElementRef', () => {
    expect(directive['el']).toEqual(el);
  });

  it('should initialize Renderer2', () => {
    expect(directive['renderer']).toEqual(renderer);
  });

  it('should initialize BrowserStorageService', () => {
    expect(directive['storageService']).toEqual(storageService);
  });
});
