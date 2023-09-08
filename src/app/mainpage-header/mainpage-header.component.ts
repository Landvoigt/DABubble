import { Component, EventEmitter, Output } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { User } from 'src/models/user.class';

@Component({
  selector: 'app-mainpage-header',
  templateUrl: './mainpage-header.component.html',
  styleUrls: ['./mainpage-header.component.scss']
})
export class MainpageHeaderComponent {
  @Output() closeEvent = new EventEmitter<void>();
  currentUser = new User();

  showLogoutPopup: boolean = false;
  showProfilePopup: boolean = false;
  showEditProfile: boolean = false;
  hoverCodeIcon: boolean = false;
  hoverPlusIcon: boolean = false;
  hoverSmileyIcon: boolean = false;
  hoverAtIcon: boolean = false;
  hoverAddClientIcon: boolean = false;

  constructor(private accountService: AccountServiceService) {
    this.currentUser = this.accountService.currentUser;
  }

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