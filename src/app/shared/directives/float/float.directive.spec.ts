import { By } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ElementRef, Component, DebugElement } from '@angular/core';
import { UtilsService } from '@services/utils.service';
import { FloatDirective } from './float.directive';

@Component({
    template: `
    <ion-content appFloat>
      <ion-card>Card 1</ion-card>
      <ion-card>Card 2</ion-card>
      <ion-card>Card 3</ion-card>
      <ion-card>Card 4</ion-card>
      <ion-card>Card 5</ion-card>
      <ion-card>Card 6</ion-card>
      <ion-card>Card 7</ion-card>
      <ion-card>Card 8</ion-card>
      <ion-card>Card 9</ion-card>
    </ion-content>`
})
class TestHoverFocusComponent {
}

describe('FloatDirective', () => {
  let component: TestHoverFocusComponent;
  let fixture: ComponentFixture<TestHoverFocusComponent>;
  let debugElement: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ IonicModule ],
      declarations: [ TestHoverFocusComponent, FloatDirective ],
      providers: [
        UtilsService,
        // ElementRef
      ]
    });

    fixture = TestBed.createComponent(TestHoverFocusComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement.query(By.css('ion-content'));
  });

  it('should be triggered when scroll', () => {
    debugElement.triggerEventHandler('mouseleave', null);
    fixture.detectChanges();
    // console.log(debugElement.nativeElement.styles);
    const card = debugElement.queryAll(By.css('ion-card'))[0];
    expect(card.nativeElement.style.boxShadow).toEqual('none');
  });

  /*xit('should has boxshadow', () => {
    debugElement.triggerEventHandler('mouseleave', null);
    debugElement.nativeElement.scroll({ top: 10 });
    fixture.detectChanges();

    const card = debugElement.queryAll(By.css('ion-card'))[0];
    fixture.detectChanges();

    expect(card.nativeElement.style.boxShadow).not.toEqual('none');
  });*/
});
