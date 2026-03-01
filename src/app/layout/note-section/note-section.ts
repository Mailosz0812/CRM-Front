import {Component, Input} from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';

@Component({
  selector: 'app-note-section',
  imports: [
    ButtonSmall
  ],
  templateUrl: './note-section.html',
})
export class NoteSection {
  @Input() notesList!: Array<String>
}
