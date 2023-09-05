import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() closeEvent = new EventEmitter<void>();

  showLogoutPopup: boolean = false;
  showProfilePopup: boolean = false;
  showEditProfile: boolean = false;
  hoverCodeIcon: boolean = false;
  hoverPlusIcon: boolean = false;
  hoverSmileyIcon: boolean = false;
  hoverAtIcon: boolean = false;
  hoverAddClientIcon: boolean = false;


  closeChannelSection() {
    this.closeEvent.emit();
  }

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