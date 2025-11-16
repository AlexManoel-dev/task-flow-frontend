import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-button',
  standalone: true,
  template: `
    <button
      class="inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90"
      [disabled]="disabled"
      (click)="clicked.emit($event)"
      [type]="type">
      <ng-content></ng-content>
    </button>
  `
})
export class UIButtonComponent {
  @Input() disabled = false;
  @Input() type: 'submit' | 'button' = 'submit';
  @Output() clicked = new EventEmitter<Event>();
}
