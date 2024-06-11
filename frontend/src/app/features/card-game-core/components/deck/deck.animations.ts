import { trigger, state, style, animate, transition } from '@angular/animations';

export const shuffleAnimation = trigger('shuffleAnimation', [
    state('*', style({ transform: 'translateX(0)' })),
    transition('* => *', [
        style({ transform: 'translateX(-100%)' }),
        animate('500ms ease-out')
    ])
])