import { Component } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent {
  showPassword: boolean = false;

  constructor(
    public accountService: AccountServiceService,
    public router: Router) { }


  /**
   * Saves the input information in the account service and navigates to the select avatar page.
   */
  saveNewUser(): void {
    this.router.navigate(['/profile']);
  }


  /**
   * Toggles the password visibility.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


  /**
   * Cancels the mainpage intro.
   */
  cancelIntro(): void {
    this.accountService.playIntro = false;
  }
}