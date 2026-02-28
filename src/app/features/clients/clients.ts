import { Component } from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';

@Component({
  selector: 'app-clients',
  imports: [
    ButtonSmall
  ],
  templateUrl: './clients.html',
})
export class Clients {
  isSidebarOpen = false;

}
