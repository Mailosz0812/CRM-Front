import { Component } from '@angular/core';
import {ButtonSmall} from '../../../shared/button-small/button-small';
import {NoteSection} from '../../../layout/note-section/note-section';
import {RouterLink} from '@angular/router';
import {UserStateService} from '../../../core/user/user-state.service';
import {async} from 'rxjs';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-admin-main',
  imports: [
    ButtonSmall,
    NoteSection,
    RouterLink,
    AsyncPipe
  ],
  templateUrl: './admin-main.html',
})
export class AdminMain {
  constructor(public userState: UserStateService) {}
}
