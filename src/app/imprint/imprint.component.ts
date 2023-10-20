import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { AccountServiceService } from '../account-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.component.html',
  styleUrls: ['./imprint.component.scss']
})
export class ImprintComponent {

  constructor(
    public location: Location, 
    private router: Router,
    public accountService: AccountServiceService) { }

  /**
   * Closes the imprint component and navigates to the last page.
   */  
  close() {
    this.location.back();
    this.accountService.playIntro = false;
  }


  /**
   * Navigates to the main page.
   */
  locateToMainpage() {
    this.router.navigate(['/']);
    this.accountService.playIntro = false;
  }
}