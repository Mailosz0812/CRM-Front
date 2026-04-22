import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-notification',
  imports: [],
  templateUrl: './notification.html',
})
export class Notification {
  @Input({
    required: true
  }) message!: string;

  @Input({
    required: true
  }) type!: 'error' | 'success'

  @Output() closeEvent = new EventEmitter<boolean>();


}
