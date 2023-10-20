import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { AccountServiceService } from '../account-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {
  
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
