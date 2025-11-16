import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-modal',
  standalone: true,
  template: `
    <div *ngIf="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black/50" (click)="close.emit()"></div>
      <div class="relative z-10 w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg animate-in fade-in-0 zoom-in-95">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">{{title}}</h3>
          <button class="rounded p-2 hover:bg-muted" (click)="close.emit()">&times;</button>
        </div>
        <div class="prose prose-sm max-w-none">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class UIModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();
}
