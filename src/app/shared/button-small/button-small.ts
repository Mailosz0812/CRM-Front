import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-button-small',
  imports: [],
  templateUrl: './button-small.html',
})
export class ButtonSmall {
  @Input({required: true}) buttonText!: string;
  @Input() isFullWidth = false;
  @Output() clickEvent = new EventEmitter<boolean>

  constructor() {}

  onClick(){
    this.clickEvent.emit(true);
  }

}
