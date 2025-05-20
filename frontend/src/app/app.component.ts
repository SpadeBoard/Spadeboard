import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpadeboardHeaderNavComponent } from './features/game-room/components/spadeboard-header-nav/spadeboard-header-nav.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SpadeboardHeaderNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
