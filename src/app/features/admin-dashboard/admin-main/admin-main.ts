import { Component } from '@angular/core';
import {ButtonSmall} from '../../../shared/button-small/button-small';
import {NoteSection} from '../../../layout/note-section/note-section';

@Component({
  selector: 'app-admin-main',
  imports: [
    ButtonSmall,
    NoteSection
  ],
  templateUrl: './admin-main.html',
})
export class AdminMain {

}
