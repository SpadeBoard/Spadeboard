import { trigger, state, style, transition, animate } from '@angular/animations';

export const cardFlipAnimation = trigger('cardFlip', [
    state('default', style({ transform: 'none' })),
    state('flipped', style({ transform: 'rotateY(180deg)' })),
    transition('default => flipped', animate('400ms')),
    transition('flipped => default', animate('200ms'))
]);