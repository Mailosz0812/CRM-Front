import { Component } from '@angular/core';
import {ButtonSmall} from '../../shared/button-small/button-small';

@Component({
  selector: 'app-client-master',
  imports: [
    ButtonSmall
  ],
  templateUrl: './client-master.html',
})
export class ClientMaster {
  isSidebarOpen = false;

}
