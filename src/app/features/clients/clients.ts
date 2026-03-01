import { Component } from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {NoteSection} from '../../layout/note-section/note-section';

@Component({
  selector: 'app-clients',
  imports: [
    ButtonSmall,
    NoteSection
  ],
  templateUrl: './clients.html',
})
export class Clients {
  isSidebarOpen = false;

}
