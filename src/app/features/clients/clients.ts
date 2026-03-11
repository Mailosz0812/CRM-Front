import { Component } from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {NoteSection} from '../../layout/note-section/note-section';
import {ClientMaster} from '../../layout/client-master/client-master';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-clients',
  imports: [
    ButtonSmall,
    NoteSection,
    ClientMaster,
    RouterLink
  ],
  templateUrl: './clients.html',
})
export class Clients {

}
