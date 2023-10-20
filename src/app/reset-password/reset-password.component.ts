import { Component, OnInit, inject } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { Firestore, collection, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { BannerServiceService } from '../banner-service.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  firestore: Firestore = inject(Firestore);

  token: string | null = null;
  tokenValid: boolean = false;
  newPassword: string = '';
  confirmPassword: string = '';
  resetEmail: string = '';

  showPassword: boolean = false;
  isPasswordValid: boolean = false;
  isPasswordEmpty: boolean = false;
  passwordPattern: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  passwordsMatch: boolean = false;

  bannerSubscription: Subscription;

  isBannerVisible: boolean = false;
  bannerMsg: string = '';

  private checkPasswordSubject = new Subject<void>();
  loading: boolean = false;

  constructor(
    // private route: ActivatedRoute,
    public accountService: AccountServiceService,
    private router: Router,
    public bannerService: BannerServiceService) {
    this.checkPasswordSubject.pipe(
      debounceTime(20)
    ).subscribe(() => {
      this.passwordCheck();
    });
  }


  ngOnInit(): void {
    // this.token = this.route.snapshot.paramMap.get('token');
    // this.getEmailOfResetter();
    this.initializeBanner();
  }


  onPasswordChange() {
    this.checkPasswordSubject.next();
  }


  // async verifyToken() {
  //   try {
  //     const tokenCache = collection(this.firestore, 'password-reset-tokens');
  //     const q = query(tokenCache, where('id', '==', this.token));
  //     const querySnapshot = await getDocs(q);

  //     if (querySnapshot.empty) {
  //       console.error('Token not found');
  //       return;
  //     }
  //     const tokenData = querySnapshot.docs[0].data();

  //     const now = new Date();
  //     const tokenDate = tokenData['date'].toDate();
  //     const diffInMs = now.getTime() - tokenDate.getTime();
  //     const diffInMinutes = diffInMs / (1000 * 60);

  //     if (diffInMinutes > 10) {
  //       this.tokenValid = false;
  //       return;
  //     }
  //     this.resetEmail = tokenData['email'];
  //     console.log(`Token is valid for ${this.resetEmail}`);
  //     this.tokenValid = true;
  //   } catch (error) {
  //     console.error('Error verifying token:', error);
  //   }
  // }

  // async getEmailOfResetter() {
  //   const currentTime = new Date();
  //   const tenMinutesAgo = new Date(currentTime.getTime() - 10 * 60 * 1000);

  //   const tokenCache = collection(this.firestore, 'password-reset-tokens');
  //   const q = query(
  //     tokenCache,
  //     where('id', '==', this.token),
  //     where('createdAt', '>', tenMinutesAgo)
  //   );
  //   const querySnapshot = await getDocs(q);
  //   const tokenData = querySnapshot.docs[0].data();

  //   if (querySnapshot.empty) {
  //     this.tokenValid = false;
  //     return;
  //   }

  //   this.resetEmail = tokenData['email'];
  //   console.log(`Token is valid for ${this.resetEmail}`);
  //   this.tokenValid = true;
  // }


  /**
   * Resets the password.
   */
  async resetPassword() {
    // const collRef = collection(this.firestore, "users");
    // const q = query(collRef, where("email", "==", this.resetEmail));
    // const querySnapshot = await getDocs(q);
    // if (!querySnapshot.empty) {
    //   const userDoc = querySnapshot.docs[0];
    //   await updateDoc(userDoc.ref, { password: this.confirmPassword });
    // }

    this.loading = true;

    const collRef = collection(this.firestore, "users");
    const q = query(collRef, where("email", "==", this.accountService.resetEmail));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(userDoc.ref, { password: this.confirmPassword });

      this.bannerService.show('Passwort geändert');
      // this.bannerService.show('Password changed');
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/']);
      }, 1800);
    }
  }


  /**
   * Subscribes to changes for the banner to show them when called.
   */
  initializeBanner() {
    this.bannerSubscription = this.bannerService.bannerContent$.subscribe(
      bannerMessage => {
        this.isBannerVisible = bannerMessage.isVisible;
        this.bannerMsg = bannerMessage.message;
      }
    );
  }


  /**
   * Executes the password validation test.
   */
  validatePassword() {
    this.isPasswordValid = this.passwordPattern.test(this.newPassword);
    this.isPasswordEmpty = this.newPassword === '';
  }


  /**
   * Checks if the new password and the confirm password fields have identical values.
   * Updates the `passwordsMatch` boolean accordingly.
   */
  passwordCheck() {
    this.passwordsMatch = this.newPassword === this.confirmPassword;
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