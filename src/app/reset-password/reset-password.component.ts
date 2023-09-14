import { Component } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, DocumentReference, DocumentSnapshot, DocumentData, query, where } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { updateDoc } from 'firebase/firestore';
import { Router } from '@angular/router';



@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  passwordForm: any;
  isValid = false;
  isPasswordValid = true;
  isNewPasswordNotValid = false;
  isConfirmPasswordNotValid = false;
  isPatternNotValid = false;
  passwordPattern: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;


  constructor(public accountService: AccountServiceService,
    private firestore: Firestore, private router: Router) {
  }

  async passwordCheck() {

    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);

    let oldPassword: string | undefined; 

    querySnapshot.forEach((queryDocSnapshot) => {
      const userData = queryDocSnapshot.data() as User;
      if (userData.email === this.accountService.emailResetPassword) {
        oldPassword = userData.password;
      }
    });

    if (oldPassword === undefined && this.newPassword === this.confirmPassword) {

      this.isPasswordValid = false;
      this.isNewPasswordNotValid = false;
      this.isConfirmPasswordNotValid = false;

    } else {
      this.isNewPasswordNotValid = true;
      this.isConfirmPasswordNotValid = true;
      this.isPasswordValid = true;
    }



    if (this.newPassword === this.confirmPassword) {
      if (this.newPassword != '' && this.confirmPassword != '' && this.passwordPattern.test(this.newPassword)) {
        this.isPasswordValid = false
      } else {
        this.isPasswordValid = true
      }
    }

    this.checkPattern();

  }


  checkPattern() {
    if (this.passwordPattern.test(this.newPassword)) {
      this.isPatternNotValid = false;
    } else {
      this.isPatternNotValid = true;
    }
  }


  checkIntro() {
    this.accountService.isIntro = false;
  }


  async resetPassword() {
    this.checkIntro();
    this.isValid = true;
    setTimeout(() => {
      this.isValid = false;
      this.router.navigate(['/']);
    }, 1500);
    if (this.newPassword !== this.confirmPassword) {
      console.log('Die Passwörter sind nicht gleich!');
      return;
    }
    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);
    let oldPassword: string | undefined;

    querySnapshot.forEach((queryDocSnapshot) => {
      const userData = queryDocSnapshot.data() as User;
      if (userData.email === this.accountService.emailResetPassword) {
        oldPassword = userData.password;
      }
    });

    if (oldPassword === undefined) {
      console.log('Benutzer mit dieser E-Mail-Adresse wurde nicht gefunden.');
      return;
    }
    if (this.newPassword === oldPassword) {
      console.log('Das Passwort kann nicht gleich dem alten Passwort sein.');
      return;
    }
    const userQuery = query(collection(this.firestore, "users"), where("email", "==", this.accountService.emailResetPassword));
    const userQuerySnapshot = await getDocs(userQuery);

    userQuerySnapshot.forEach(async (queryDocSnapshot) => {
      const userDocRef = doc(this.firestore, 'users', queryDocSnapshot.id);
      await updateDoc(userDocRef, {
        password: this.newPassword
      });
    });
    this.isPasswordValid = true;
    console.log('Das Passwort wurde erfolgreich geändert.');
  }

}

