import { Component, inject } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { Router } from '@angular/router';
import { Firestore, addDoc, query, where } from '@angular/fire/firestore';
import { collection, getDocs } from 'firebase/firestore';
import { BannerServiceService } from '../banner-service.service';
import { Subscription } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-send-link-to-user',
  templateUrl: './send-link-to-user.component.html',
  styleUrls: ['./send-link-to-user.component.scss']
})
export class SendLinkToUserComponent {
  firestore: Firestore = inject(Firestore);
  userCollection = collection(this.firestore, "users");

  bannerSubscription: Subscription;

  isBannerVisible: boolean = false;
  bannerMsg: string = '';

  email: string = '';
  token: string = '';
  resetPasswordMessage: string = `Vergib dein neues Passwort auf dieser Seite: dabubble.timvoigt.ch/reset-password${this.token}`;
  secretKey: string = "xaygapnd";

  sending: boolean = false;
  isEmailValid: boolean = false;
  emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  constructor(
    public accountService: AccountServiceService,
    public router: Router,
    public bannerService: BannerServiceService,
    private fb: FormBuilder,
    private httpClient: HttpClient) {
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
   * Validates a user's email.
   */
  async checkUserEmail(): Promise<void> {
    this.isEmailValid = false;

    if (this.email === '' || !this.emailPattern.test(this.email)) {
      return;
    }

    const q = query(this.userCollection, where("email", "==", this.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      this.isEmailValid = true;
    }
  }


  /**
   * Sends a mail to the user with a link to reset his password.
   */
  async sendMail(event: any) {
    // await this.saveToken();
    // this.sending = true;
    // event.preventDefault();
    // const data = new FormData(event.target);

    // fetch(`https://formspree.io/f/${this.secretKey}`, {
    //   method: "POST",
    //   body: data,
    //   headers: {
    //     'Accept': 'application/json'
    //   }
    // }).then(() => {
    //   this.sending = false;
    //   this.router.navigate(['/send-link-success']);
    // }).catch((error) => {
    //   console.log(error);
    // });

    this.bannerService.show('Email versendet');
    this.sending = true;
    // this.bannerService.show('Email sent');
    setTimeout(() => {
      this.accountService.resetEmail = this.email;
      this.sending = false;
      this.router.navigate(['/reset-password']);
    }, 1800);
  }


  /**
   * Saves the email of the user that wants to reset the pw to firestore (normally with token)
   */
  // async saveToken() {
  //   const tokenCache = collection(this.firestore, 'password-reset-tokens');
  //   const tokenData = {
  //     // id: this.token,
  //     email: this.email,
  //     date: new Date(),
  //   };
  //   await addDoc(tokenCache, tokenData);
  // }


  // /**
  //  * Generate a secure, random token for password reset functionality.
  //  * @returns {Promise<string>} A secure, random token.
  //  */
  // async generatePasswordResetToken(): Promise<string> {
  //   try {
  //     const array = new Uint8Array(20);
  //     crypto.getRandomValues(array);
  //     return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  //   } catch (error) {
  //     console.error('Failed to generate token', error);
  //     throw error;
  //   }
  // }


  // async generateToken(event: any) {
  //   try {
  //     this.token = await this.generatePasswordResetToken();
  //     await this.saveToken();
  //     await this.sendMail(event);
  //   } catch (error) {
  //     console.error('Error generating token:', error);
  //   }
  // }


  /**
   * Cancels the mainpage intro.
   */
  cancelIntro(): void {
    this.accountService.playIntro = false;
  }
}