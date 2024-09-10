import { Injectable } from '@angular/core';
import { createAnimation } from '@ionic/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationsService {

  constructor() { }

  enterAnimation(baseElement) {
    const root = baseElement.shadowRoot;
    const backdropAnimation = createAnimation()
      .addElement(root.querySelector('ion-backdrop'))
      .fromTo('opacity', '0.01', '0.4');

    const wrapperAnimation = createAnimation()
      .addElement(root.querySelector('.modal-wrapper'))
      .keyframes([
        { offset: 0, opacity: '0', transform: 'translateX(200%)' },
        { offset: 1, opacity: '0.99', transform: 'translateX(0)' }
      ]);

    return createAnimation()
      .addElement(baseElement)
      .easing('ease-out')
      .duration(300)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }

  leaveAnimation(baseElement) {
    return createAnimation(baseElement).direction('reverse');
  }
}
