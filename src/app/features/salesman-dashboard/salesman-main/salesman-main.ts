import { Component } from '@angular/core';
import {NoteSection} from '../../../layout/note-section/note-section';
import {FilterPill} from '../../../shared/fitler-pill/filter-pill.component';
import {ButtonSmall} from '../../../shared/button-small/button-small';

@Component({
  selector: 'app-salesman-main',
  imports: [
    NoteSection,
    FilterPill,
    ButtonSmall
  ],
  templateUrl: './salesman-main.html',
})
export class SalesmanMain {

}
