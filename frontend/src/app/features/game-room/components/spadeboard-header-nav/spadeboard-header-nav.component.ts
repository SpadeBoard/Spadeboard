import { Component } from '@angular/core';
import { VERSION } from '../../../../../environments/version';

@Component({
  selector: 'app-spadeboard-header-nav',
  imports: [],
  templateUrl: './spadeboard-header-nav.component.html',
  styleUrl: './spadeboard-header-nav.component.scss'
})
export class SpadeboardHeaderNavComponent {
  protected getVersion(): string {
    return `Version ${VERSION.version}\nCommit ${VERSION.hash}\nBranch ${VERSION.branch}`;
  }
}
