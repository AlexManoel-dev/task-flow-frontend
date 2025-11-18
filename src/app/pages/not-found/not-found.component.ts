// not-found.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html'
})
export class NotFoundComponent {
  constructor(
    private router: Router,
    private location: Location
  ) {}

  goHome() {
    this.router.navigate(['/dashboard']);
  }

  goBack() {
    this.location.back();
  }
}