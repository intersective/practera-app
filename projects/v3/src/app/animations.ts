import {
  animation, trigger, animateChild, group,
  transition, animate, style, query
} from '@angular/animations';

export const fadeIn = animation([
  style({ opacity: 0 }),
  animate('{{time}}', style({ opacity: 1 })),
]);
