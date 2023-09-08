import { Component } from '@angular/core';
import { User } from 'src/models/user.class';
import { AccountServiceService } from '../account-service.service';

@Component({
  selector: 'app-mainpage-channels',
  templateUrl: './mainpage-channels.component.html',
  styleUrls: ['./mainpage-channels.component.scss']
})
export class MainpageChannelsComponent {
  currentUser = new User();

  constructor(private accountService: AccountServiceService) {
    this.currentUser = this.accountService.currentUser;
  }

}
