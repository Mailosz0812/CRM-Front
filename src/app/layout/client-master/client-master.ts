import { Component } from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-client-master',
  imports: [
    ButtonSmall,
    RouterLink
  ],
  templateUrl: './client-master.html',
})
export class ClientMaster {
  isSidebarOpen = false;

}
