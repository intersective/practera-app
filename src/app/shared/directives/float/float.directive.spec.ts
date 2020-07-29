import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { ElementRef, Component, DebugElement } from '@angular/core';
import { UtilsService } from '@services/utils.service';
import { FloatDirective } from './float.directive';
import { Apollo } from 'apollo-angular';

// @NOTE: keep this for future elements debugging (unit testing purpose only)
function cardListingHelper(debugElement) {
  const cards: DebugElement[] = debugElement.queryAll(By.css('ion-card'));
  cards.forEach((debugCard, index) => {
    const card: HTMLElement = debugCard.nativeElement;
    card.style.top = `${100 * index}`;
    const boundary = card.getBoundingClientRect();
  });
}

@Component({
  template: `<ion-content appFloat [isActivityCard]='true'>
    <br>
    <ion-card style="height: 500px;">1</ion-card>
    <br>
    <ion-card style="height: 500px;">2</ion-card>
    <br>
    <ion-card style="height: 500px;">3</ion-card>
    <br>
    <ion-card style="height: 500px;">4</ion-card>
  </ion-content>`
})
class TestAppFloatIsActivityCardComponent {}

@Component({
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>TestBed</ion-title>
      </ion-toolbar>
    </ion-header>
    <br>
    <ion-content class="ion-padding" appFloat>
      <ion-card style="margin-top:200px;">
        <ion-card-header>Card 1 Header</ion-card-header>
        <ion-card-content>Card 1 Content</ion-card-content>
      </ion-card>
      <br>

      <ion-card style="margin-top:200px;">
        <ion-card-header>Card 2 Header</ion-card-header>
        <ion-card-content>Card 2 Content</ion-card-content>
      </ion-card>
      <br>

      <ion-card style="margin-top:200px;">
        <ion-card-header>Card 3 Header</ion-card-header>
        <ion-card-content>Card 3 Content</ion-card-content>
      </ion-card>
      <br>

      <ion-card style="margin-top:200px;">
        <ion-card-header>Card 4 Header</ion-card-header>
        <ion-card-content>Card 4 Content</ion-card-content>
      </ion-card>
      <br>

      <ion-card style="margin-top:200px;">
        <ion-card-header>Card 5 Header</ion-card-header>
        <ion-card-content>Card 5 Content</ion-card-content>
      </ion-card>
      <br>

      <ion-card style="margin-top:200px;">
        <ion-card-header>Card 6 Header</ion-card-header>
        <ion-card-content>Card 6 Content</ion-card-content>
      </ion-card>
      <br>

      <ion-card style="margin-top:200px;">
        <ion-card-header>Card 7 Header</ion-card-header>
        <ion-card-content>Card 7 Content</ion-card-content>
      </ion-card>
      <br>

      <ion-card style="margin-top:200px;">
        <ion-card-header>Card 8 Header</ion-card-header>
        <ion-card-content>Card 8 Content</ion-card-content>
      </ion-card>
      <br>

      <ion-card style="margin-top:200px;">
        <ion-card-header>Card 9 Header</ion-card-header>
        <ion-card-content>Card 9 Content</ion-card-content>
      </ion-card>
      <br>
    </ion-content>`
})
class TestScrollComponent {
}

describe('FloatDirective', () => {
  let component: TestScrollComponent | TestAppFloatIsActivityCardComponent;
  let fixture: ComponentFixture<TestScrollComponent | TestAppFloatIsActivityCardComponent>;
  let debugElement: DebugElement;
  let directive: DebugElement;

  describe('without "isActivityCard"', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ IonicModule ],
        declarations: [ TestScrollComponent, FloatDirective ],
        providers: [
          Apollo,
          UtilsService,
          // ElementRef
        ]
      });

      fixture = TestBed.createComponent(TestScrollComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement.query(By.css('ion-content'));
    });

    it('should be triggered when scroll', () => {
      debugElement.triggerEventHandler('mouseleave', null);
      fixture.detectChanges();
      const card = debugElement.queryAll(By.css('ion-card'))[0];
      expect(card.nativeElement.style.boxShadow).toEqual('none');
    });

    it('should has boxshadow', () => {
      debugElement.triggerEventHandler('mouseleave', null);
      debugElement.nativeElement.scroll({ top: 10 });
      fixture.detectChanges();

      const cards = debugElement.queryAll(By.css('ion-card'));

      const firstCard = cards[cards.length - 1];

      firstCard.nativeElement.top = 10;
      expect(firstCard.nativeElement.style.boxShadow).not.toEqual('none');
    });

    it('should have different shadow if "isActivityCard" is false', () => {
      const cards: DebugElement[] = debugElement.queryAll(By.css('ion-card'));
      const lastCard: HTMLElement = cards[cards.length - 1].nativeElement;
      lastCard.style.boxShadow = 'none';

      debugElement.triggerEventHandler('wheel', null);
      debugElement.triggerEventHandler('mouseleave', null);

      fixture.detectChanges();
      expect(lastCard.style.boxShadow).not.toEqual('none');
    });
  });

  describe('with "isActivityCard"', () => {
    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [ IonicModule ],
        declarations: [ FloatDirective, TestAppFloatIsActivityCardComponent ],
        providers: [
          Apollo,
          UtilsService,
        ]
      });

      fixture = TestBed.createComponent(TestAppFloatIsActivityCardComponent);
      component = fixture.componentInstance;
      debugElement = fixture.debugElement.query(By.css('ion-content'));
      directive = fixture.debugElement.query(By.directive(FloatDirective));

      fixture.detectChanges();
    });

    it('should have shadow if "isActivityCard" is true', () => {
      const cards: DebugElement[] = debugElement.queryAll(By.css('ion-card'));
      const lastCard: HTMLElement = cards[cards.length - 1].nativeElement;
      lastCard.style.boxShadow = 'none';

      debugElement.triggerEventHandler('wheel', null);
      debugElement.triggerEventHandler('mouseleave', null);

      fixture.detectChanges();
      expect(lastCard.style.boxShadow).not.toEqual('none');
    });
  });
});
