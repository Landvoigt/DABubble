import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ChannelServiceService } from '../channel-service.service';
import { Observable, Subscription, map, startWith, tap } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Firestore, arrayUnion, collection, doc, getDocs, updateDoc } from '@angular/fire/firestore';
import { Channel } from 'src/models/channel.class';
import { User } from 'src/models/user.class';
import { DialogChannelMembersComponent } from '../dialog-channel-members/dialog-channel-members.component';
import { BannerServiceService } from '../banner-service.service';

@Component({
  selector: 'app-dialog-channel-add-new-members',
  templateUrl: './dialog-channel-add-new-members.component.html',
  styleUrls: ['./dialog-channel-add-new-members.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DialogChannelAddNewMembersComponent implements OnInit, OnDestroy {
  firestore: Firestore = inject(Firestore);
  userCollectionRef = collection(this.firestore, 'users');
  private subscription: Subscription;
  currentChannel = new Channel();

  control = new FormControl();
  selectedUser: User | null = null;

  allUsers: any[] = [];
  filteredUsers: Observable<any[]>;

  hasSuggestions: boolean = false;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogChannelAddNewMembersComponent>,
    public channelService: ChannelServiceService,
    private bannerService: BannerServiceService) { }


  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   */
  async ngOnInit(): Promise<void> {
    this.subscribeToCurrentChannel();
    await this.initializeUsers();
  }


  /**
   * Subscribes to the current channel updates.
   */
  private subscribeToCurrentChannel(): void {
    this.subscription = this.channelService.currentChannel$.subscribe(channel => {
      if (channel && Object.keys(channel).length > 0) {
        this.currentChannel = channel;
      }
    });
  }

  /**
   * Fetches all users and initializes user related controls.
   */
  private async initializeUsers(): Promise<void> {
    await this.getUsers();
    this.control = new FormControl('', [this.validateName.bind(this)]);
    this.initializeFilteredUsers();
  }


  /**
   * Initializes the filteredUsers observable which filters users based on control value changes.
   */
  private initializeFilteredUsers(): void {
    this.filteredUsers = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
      tap(suggestions => {
        this.hasSuggestions = suggestions && suggestions.length > 0;
      })
    );
  }


  /**
   * Fetches all users from the Firestore collection.
   */
  async getUsers(): Promise<void> {
    const querySnapshot = await getDocs(this.userCollectionRef);
    this.allUsers = querySnapshot.docs.map(doc => doc.data());
  }


  /**
   * Normalizes a string value for filtering. 
   * It converts the value to lowercase. 
   * If the value is an object, it attempts to retrieve the name property.
   * @param {any} value - The value to be normalized.
   * @returns {string} The normalized string.
   */
  private _normalizeValue(value: any): string {
    if (typeof value === 'string') {
      return value.toLowerCase();
    } else if (value && value.name) {
      return value.name.toLowerCase();
    }
    return '';
  }


  /**
   * Checks if a user is already a member of the current channel.
   * @param {User} user - The user to be checked.
   * @returns {boolean} True if the user is already a member, otherwise false.
   */
  private _isUserMember(user: User): boolean {
    return this.currentChannel.members.includes(user.id);
  }


  /**
   * Filters users based on a given search value.
   * @param {any} value - The search value.
   * @returns {User[]} A filtered list of users.
   */
  private _filter(value: any): User[] {
    const filterValue = this._normalizeValue(value);

    if (filterValue.length < 1) {
      return [];
    }

    return this.allUsers.filter(user => {
      if (this._isUserMember(user)) {
        return false;
      }
      return this._doesNameMatch(user.name, filterValue);
    });
  }


  /**
   * Checks if a user's name starts with a given search value.
   * @param {string} name - The name of the user.
   * @param {string} searchValue - The value to search for.
   * @returns {boolean} True if the name matches the search value, otherwise false.
   */
  private _doesNameMatch(name: string, searchValue: string): boolean {
    const normalizedName = this._normalizeValue(name);
    const [firstName, lastName] = normalizedName.split(' ');

    return (firstName && firstName.startsWith(searchValue)) ||
      (lastName && lastName.startsWith(searchValue));
  }


  /**
   * Displays the name of a user object.
   * @param {any} user - The user object.
   * @returns {string} The name of the user or an empty string.
   */
  displayUserName(user: any): string {
    return user && user.name ? user.name : '';
  }


  /**
   * Validates that the chosen name is among the available users.
   * @param {FormControl} control - The form control to validate.
   * @returns {Object | null} Returns an error object if validation fails, otherwise null.
   */
  validateName(control: FormControl): { [key: string]: any } | null {
    const user: User = control.value;
    const validName = this.allUsers.some(u => u.name === user.name);
    return validName ? null : { invalidName: true };
  }


  /**
   * Takes the selected user and puts the value to the input field.
   * @param user - The user selected
   */
  selectUser(user: any): void {
    this.selectedUser = user;
    this.control.setValue(user);
    this.control.updateValueAndValidity();
  }


  /**
   * Adds a new member to the Firestore collection and closes the dialog.
   */
  async addNewMember(): Promise<void> {
    this.selectedUser = this.control.value as User;
    if (this.isValidUser(this.selectedUser)) {
      await this.updateChannelMembers(this.selectedUser.id);
      this.dialogRef.close();
      this.bannerService.show('Mitglied hinzugefügt');
      // this.bannerService.show('User added');
      this.openChannelMembers();
    } else {
      console.error("User or User ID is invalid");
    }
  }


  /**
   * Checks if the provided user object is valid.
   * @param {User | null} user - The user object to check.
   * @returns {boolean} True if the user object is valid, otherwise false.
   */
  isValidUser(user: User | null): boolean {
    return user && user.id ? true : false;
  }


  /**
   * Updates the channel members in the Firestore collection.
   * @param {string} userId - The ID of the user to add.
   */
  async updateChannelMembers(userId: string): Promise<void> {
    const channelDocRef = doc(this.firestore, 'channels', this.currentChannel.id);
    await updateDoc(channelDocRef, {
      members: arrayUnion(userId)
    });
  }


  /**
   * Re-opens the channel members dialog.
   */
  openChannelMembers() {
    this.dialog.open(DialogChannelMembersComponent);
  }


  /**
   * Unsubscribes from the current channel updates.
   */
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
