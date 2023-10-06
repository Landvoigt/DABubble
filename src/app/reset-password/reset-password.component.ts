<<<<<<< HEAD
import { Component, OnInit } from '@angular/core';
=======
import { Component } from '@angular/core';
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
import { AccountServiceService } from '../account-service.service';
import { Firestore, collection, doc, getDocs, query, where } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { updateDoc } from 'firebase/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
<<<<<<< HEAD
export class ResetPasswordComponent  {
=======
export class ResetPasswordComponent {
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
  newPassword: string = '';
  confirmPassword: string = '';
  passwordForm: any;
  isValid = false;
  isPasswordValid = true;
  isNewPasswordNotValid = false;
  isConfirmPasswordNotValid = false;
  isPatternValid = false;
  showPassword = false;
<<<<<<< HEAD
  newPasswordExists = false;
  isEmailExist = false;
=======
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
  passwordPattern: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;


  constructor(public accountService: AccountServiceService,
    private firestore: Firestore, private router: Router) {
<<<<<<< HEAD
      if(this.accountService.emailResetPassword) {
        this.isEmailExist = true;
      }else {
        this.isEmailExist = false;
      }
      
  }


=======
  }

>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
  async passwordCheck() {


    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);

    let oldPassword: string | undefined;

    querySnapshot.forEach((queryDocSnapshot) => {
      const userData = queryDocSnapshot.data() as User;
      if (userData.email === this.accountService.emailResetPassword) {
        oldPassword = userData.password;
<<<<<<< HEAD
        this.isEmailExist = true;
      }else {
        this.isEmailExist = false;
      }
      if (userData.password === this.newPassword) {
        this.newPasswordExists = true;
        this.confirmPassword = '';
        } else {
          this.newPasswordExists = false;
         
        }
=======
      }
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
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
      console.log('pattern-test: ', this.passwordPattern.test(this.newPassword));

      this.isPatternValid = true;
    } else {
      this.isPatternValid = false;
      this.confirmPassword = '';
    }
  }


  checkIntro() {
    this.accountService.isIntro = false;
  }


  async resetPassword() {
<<<<<<< HEAD
   
  
=======
    this.checkIntro();
    this.isValid = true;
    setTimeout(() => {
      this.isValid = false;
      this.router.navigate(['/']);
    }, 1500);
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
    if (this.newPassword !== this.confirmPassword) {
      console.log('Die Passwörter sind nicht gleich!');
      return;
    }
<<<<<<< HEAD
  
    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);
    let oldPassword: string | undefined;
    this.newPasswordExists = false;
  
=======
    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);
    let oldPassword: string | undefined;

>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
    querySnapshot.forEach((queryDocSnapshot) => {
      const userData = queryDocSnapshot.data() as User;
      if (userData.email === this.accountService.emailResetPassword) {
        oldPassword = userData.password;
<<<<<<< HEAD
        this.isEmailExist = true;
      }else {
        this.isEmailExist = false;
      }
      if (userData.password === this.newPassword) {
        this.newPasswordExists = true;
        this.confirmPassword = '';
       
        
      } else {
          this.newPasswordExists = false;
        }
    });
  
    // if (oldPassword === undefined) {
    //   console.log('Benutzer mit dieser E-Mail-Adresse wurde nicht gefunden.');
    //   return;
    // }
  
    // if (this.newPasswordExists) {
    //   console.log('Das neue Passwort existiert bereits in der Datenbank.');
    //   return;
    // }
  
    // if (this.newPassword === oldPassword) {
    //   console.log('Das Passwort kann nicht gleich dem alten Passwort sein.');
    //   return;
    // }
  
    const userQuery = query(collection(this.firestore, "users"), where("email", "==", this.accountService.emailResetPassword));
    const userQuerySnapshot = await getDocs(userQuery);
  
=======
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

>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8
    userQuerySnapshot.forEach(async (queryDocSnapshot) => {
      const userDocRef = doc(this.firestore, 'users', queryDocSnapshot.id);
      await updateDoc(userDocRef, {
        password: this.newPassword
      });
    });
<<<<<<< HEAD
  
    this.isPasswordValid = true;
    if(this.isPasswordValid) {
      this.checkIntro();
      this.isValid = true;
      setTimeout(() => {
        this.isValid = false;
        this.router.navigate(['/']);
      }, 1500);
    }
    console.log('Das Passwort wurde erfolgreich geändert.');
  }
  
=======
    this.isPasswordValid = true;
    console.log('Das Passwort wurde erfolgreich geändert.');
  }
>>>>>>> 5e9dc2590ee32b0477fb53aab40e7b77fc6d36b8

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

}

