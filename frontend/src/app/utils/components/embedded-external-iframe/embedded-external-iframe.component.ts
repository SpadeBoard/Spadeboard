import { Component, computed, inject, input, InputSignal, output, OutputEmitterRef, Signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-embedded-external-iframe',
  imports: [],
  templateUrl: './embedded-external-iframe.component.html',
  styleUrl: './embedded-external-iframe.component.scss'
})
export class EmbeddedExternalIframeComponent {
  private readonly domSanitizer: DomSanitizer = inject(DomSanitizer);

  $websiteUrl: InputSignal<string> = input<string>("");
  // CHECKME: Security, cross-site scripting
  $safeWebsiteUrl: Signal<SafeResourceUrl> = computed(() => this.domSanitizer.bypassSecurityTrustResourceUrl((this.$websiteUrl())));

  $closed: OutputEmitterRef<void> = output<void>();
  
  protected onInfoClose(event: Event): void {
    this.$closed.emit();
  }

  protected onIframeError(): void {
    // Iframe failed to load, fallback
    this.openInNewTab();
  }

  private openInNewTab(): void {
    window.open(this.$websiteUrl(), '_blank');
    this.$closed.emit();
  }
}
