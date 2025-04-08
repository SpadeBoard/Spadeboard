import { Routes } from '@angular/router';
import { GameRoomComponent } from './features/game-room/components/game-room/game-room.component';
export const routes: Routes = [
    {path: '', component: GameRoomComponent},
    {path: 'game-room', component: GameRoomComponent}
];
