import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [NgFor],
  templateUrl: './admin.component.html'
})
export class AdminComponent {
  constructor(public data: DataService) {}
}
