import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { User } from 'src/models/user.class';
import { AccountServiceService } from '../account-service.service';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  isIntro = true;
  user = new User();
  isEmailExist: boolean = false;
  isPasswordExist: boolean = false;
  firestore: Firestore = inject(Firestore);
  isEmailValid: boolean = false;
  emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  isPasswordValid: boolean = false;
  showPassword = false;

  constructor(public accountService: AccountServiceService, private router: Router, private ref: ChangeDetectorRef) {
    this.isIntro = accountService.isIntro;
  }

  ngOnInit(): void {
    console.log('this.accountService.usersArray: ', this.accountService.usersArray);
  }

  checkIntro() {
    this.isIntro = false;
  }


  async checkUserEmail() {
    if (this.user.email === '' || !this.emailPattern.test(this.user.email)) {
      this.isEmailValid = true;
      return;
    }
    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);
    this.isEmailExist = querySnapshot.docs.some((doc) => {
      const userData = doc.data() as User;
      return userData.email === this.user.email;
    });

    if (this.isEmailExist) {
      this.isEmailValid = true;
    } else {
      this.isEmailValid = false;
    }
  }


  async checkUserPassword() {
    if (this.user.password === '') {
      this.isPasswordValid = true;
      return;
    }
    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);
    this.isPasswordExist = querySnapshot.docs.some((doc) => {
      const userData = doc.data() as User;
      return userData.password === this.user.password;
    });

    if (this.isPasswordExist) {
      this.isPasswordValid = true;
    } else {
      this.isPasswordValid = false;
    }
  }




  async login() {
    const email = this.user.email;
    const password = this.user.password;

    if (email && password) {
      const collRef = collection(this.firestore, "users");
      const querySnapshot = await getDocs(collRef);

      let userFound = false;

      querySnapshot.forEach(async (queryDocSnapshot) => {
        const userData = queryDocSnapshot.data() as User;

        if (userData.email === email) {
          userFound = true;

          if (userData.password === password) {
            console.log('Erfolgreich angemeldet:', userData);

            const userDocRef = doc(this.firestore, 'users', queryDocSnapshot.id);
            await updateDoc(userDocRef, {
              loggedIn: true
            });
            const userDoc = await getDoc(userDocRef);
            const updatedUserData = userDoc.data() as User;
            console.log('Benutzerdaten nach dem Einloggen:', updatedUserData);
            this.accountService.setLoggedInUser(updatedUserData);
            
            this.router.navigate(['/main']);

          } else {
            console.log('Falsches Passwort');
          }
        }
      });

      if (!userFound) {
        console.log('Benutzer ist nicht vorhanden!');
      }
    } else {
      console.log('Bitte füllen Sie beide Eingabefelder aus.');
    }

  }

  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}