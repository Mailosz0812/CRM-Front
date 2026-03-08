import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-fitler-pill',
  imports: [],
  templateUrl: './filter-pill.component.html',
})
export class FilterPill {
  @Input({required:true}) pillText!: string;
  @Output() clickEvent = new EventEmitter<boolean>

  onClick(clicked: boolean){
    this.clickEvent.emit(clicked);
  }
}
