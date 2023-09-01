import { Component } from '@angular/core';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.scss']
})
export class MainpageComponent {
  showLogoutPopup: boolean = false;
  showProfilePopup: boolean = false;
  showEditProfile: boolean = false;
  hoverCodeIcon: boolean = false;
  hoverPlusIcon: boolean = false;
  hoverSmileyIcon: boolean = false;
  hoverAtIcon: boolean = false;
  hoverAddClientIcon: boolean = false;


  /**
   * Toggles the visibility of the logout popup.
   */
  toggleLogoutPopup(): void {
    this.showLogoutPopup = !this.showLogoutPopup;
  }


  /**
  * Closes the logout popup and resets the state of the edit profile flag.
  */
  closeLogoutPopup(): void {
    this.showLogoutPopup = false;
    this.showEditProfile = false;
  }


  /**
   * Toggles the visibility of the profile information popup.
   */
  toggleProfilePopup(): void {
    this.showProfilePopup = !this.showProfilePopup;
  }


  /**
   * Closes the profile information popup.
   */
  closeProfilePopup(): void {
    this.showProfilePopup = false;
  }


  /**
   * Toggles the edit profile mode.
   */
  toggleEditProfile(): void {
    this.showEditProfile = !this.showEditProfile;
  }

  saveEditedUserInformation() {
    /// firebase save
    this.toggleEditProfile();
  }

  logoutUser() {
    // login out
  }
}