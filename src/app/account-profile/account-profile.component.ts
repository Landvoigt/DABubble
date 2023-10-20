import { Component, inject } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { BannerServiceService } from '../banner-service.service';
import { Subscription } from 'rxjs';
import { Firestore, addDoc, collection, doc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss']
})
export class AccountProfileComponent {
  firestore: Firestore = inject(Firestore);
  private storage = getStorage();
  userCollection = collection(this.firestore, "users");

  bannerSubscription: Subscription;
  isBannerVisible: boolean = false;
  bannerMsg: string = '';

  avatars = [
    'avatar_standard_(1)',
    'avatar_standard_(2)',
    'avatar_standard_(3)',
    'avatar_standard_(4)',
    'avatar_standard_(5)',
    'avatar_standard_(6)'
  ];

  avatarSet: boolean = false;
  loading: boolean = false;

  constructor(
    public accountService: AccountServiceService,
    public bannerService: BannerServiceService,
    public router: Router) {
    this.initializeBanner();
  }


  /**
   * Subscribes to changes for the banner to show them when called.
   */
  initializeBanner(): void {
    this.bannerSubscription = this.bannerService.bannerContent$.subscribe(
      bannerMessage => {
        this.isBannerVisible = bannerMessage.isVisible;
        this.bannerMsg = bannerMessage.message;
      }
    );
  }


  /**
   * Uploads an image to a storage reference and updates the user avatar source.
   * @param {Event} event - The event object that contains the file input.
   */
  async uploadImage(event: any): Promise<void> {
    try {
      this.loading = true;
      const file = event.target.files[0];
      const filePath = `${file.name}`;
      const fileRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(fileRef, file);
      const snapshot = await uploadTask;
      let imgSrc = await getDownloadURL(snapshot.ref);
      this.accountService.newUser.avatarSrc = imgSrc;
      this.avatarSet = true;
      this.loading = false;
    } catch (error) {
      console.error('Error uploading image', error);
    }
  }


  /**
   * Sets a chosen avatar to the new user and updates the avatarSet flag.
   * @param {any} i - The index to select the avatar.
   */
  chooseAvatar(i: any): void {
    let fileName = this.avatars[i];
    let imgSrc = `assets/img/${fileName}.png`
    this.accountService.newUser.avatarSrc = imgSrc;
    this.avatarSet = true;
  }


  /**
   * Creates a new user account, updates the document to include the new user's ID,
   * shows a success banner, and navigates to the home route after a delay.
   */
  async createAccount(): Promise<void> {
    this.loading = true;
    const newUser = await addDoc(this.userCollection, this.accountService.newUser.toJSON());
    const newUserDoc = doc(this.userCollection, newUser.id);
    await updateDoc(newUserDoc, { id: newUser.id });

    this.bannerService.show('Account erstellt');
    // this.bannerService.show('Account created');
    setTimeout(() => {
      this.router.navigate(['/']).then(() => {
        this.accountService.playIntro = false;
        this.loading = false;
      });
    }, 1800);
  }


  /**
   * Cancels the mainpage intro.
   */
  cancelIntro(): void {
    this.accountService.playIntro = false;
  }
}