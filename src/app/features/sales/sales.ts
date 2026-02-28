import { Component } from '@angular/core';

@Component({
  selector: 'app-sales',
  imports: [],
  templateUrl: './sales.html',
})
export class Sales {
  isOrder1Expanded = false;
  isOrder1Done = false;

  isOrder2Expanded = false;

  markAsDone(event: Event) {
    event.stopPropagation();
    this.isOrder1Done = true;
    this.isOrder1Expanded = false;
  }
}
