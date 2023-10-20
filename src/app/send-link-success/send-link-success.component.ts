import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccountServiceService } from '../account-service.service';

@Component({
  selector: 'app-send-link-success',
  templateUrl: './send-link-success.component.html',
  styleUrls: ['./send-link-success.component.scss']
})
export class SendLinkSuccessComponent {

  constructor(
    private router: Router,
    public accountService: AccountServiceService) { }


  /**
   * Navigates to the main page.
   */
  locateToMainpage() {
    this.router.navigate(['/']);
    this.accountService.playIntro = false;
  }
}