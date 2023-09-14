import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { NgForm } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { AccountServiceService } from '../account-service.service';
import { onSnapshot, query, QuerySnapshot, where } from 'firebase/firestore';
import { Router } from '@angular/router';


export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  loggedIn!: boolean;
  isEmailExist: boolean = false;
  isPasswordExist: boolean = false;
  isName: boolean = false;
  isValidName = true;
  isValidEmail = true;
  isValidPassword = true;
  user = new User();
  firestore: Firestore = inject(Firestore);
  namePattern: RegExp = /^[a-zA-Z\süöäßÜÖÄ]*$/;
  emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  passwordPattern: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  isChecked: boolean = false;
  uID: any;
  isPasswordNotValid = false;
  isEmailNotValid = false;


  @ViewChild('accountForm', { static: false }) accountForm: NgForm;


  task: Task = {
    name: 'Indeterminate',
    completed: false,
    color: 'primary',
    subtasks: [
      { name: 'Primary', completed: false, color: 'primary' },
      { name: 'Accent', completed: false, color: 'accent' },
      { name: 'Warn', completed: false, color: 'warn' },
    ],
  };


  submitForm() {  // hier wird das Formular gesendet
    this.saveUser(this.accountForm);
  }



  ngOnInit(): void {   // damit wird die Variable meinBoolean überwacht und abonniert für die Änderung
    this.accountService.meinBoolean$.subscribe((value) => {
      if (value === true) {
        this.formAction();
      }
    });
    this.getUsersFirestore();
  }

  formAction() {
    this.submitForm();
    console.log('Die Funktion wurde automatisch ausgeführt.');
  }



  constructor(public accountService: AccountServiceService, public router: Router) {

    const lastBooleanIndex = this.accountService.currentBoolean.length - 1;
    const lastUserIndex = this.accountService.currentUser.length - 1;

    if (lastBooleanIndex >= 0) {
      const lastBoolean = this.accountService.currentBoolean[lastBooleanIndex];
      this.isName = lastBoolean.isName;
      this.isValidEmail = lastBoolean.isValidName;
      this.isValidPassword = lastBoolean.isValidPassword;
      this.isPasswordExist = lastBoolean.isPasswordExist;
      this.isEmailExist = lastBoolean.isEmailExist;
      this.isValidEmail = lastBoolean.isValidEmail;
      this.isChecked = lastBoolean.isChecked;
    }

    if (lastUserIndex >= 0) {
      const lastUser = this.accountService.currentUser[lastUserIndex];
      this.user.name = lastUser.name;
      this.user.email = lastUser.email;
      this.user.password = lastUser.password;
    }

    this.checkUserName();
    this.checkUserEmail();
    this.checkUserPassword();
  }


  checkIntro() {
    this.accountService.isIntro = false;
  }


  async saveUser(userForm: NgForm) {
    if (this.isName &&
      !this.isEmailExist &&
      !this.isPasswordExist) {
      const collRef = collection(this.firestore, "users");
      const newUser = await addDoc(collRef, {
        name: this.user.name,
        email: this.user.email,
        password: this.user.password,
        loggedIn: false,
        isActive: false,
        friends: [],
        channels: [],
        avatarSrc: this.accountService.imagePathService
      });
      userForm.resetForm();
      this.isValidName = true;
      this.isValidEmail = true;
      this.isValidPassword = true;
      this.isChecked = false;

      await this.addIdToUser(newUser.id);
    }
  }

  async addIdToUser(_id: string) {
    try {
      const userDocRef = doc(this.firestore, 'users', _id);
      await setDoc(userDocRef, { id: _id }, { merge: true });

    } catch (error) {
      console.error("Error updating channel:", error);
    }
  }


  async getUsersFirestore() {    // Test
    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);
    querySnapshot.forEach((doc) => {
      const userData = doc.data() as User;
      const documentId = doc.id;
      console.log('Dokument ID:', documentId);
      console.log('User Data:', userData);
    });

  }


  async getLoggedInUsers() {   // Test
    const collRef = collection(this.firestore, "users");

    try {
      const querySnapshot = await getDocs(collRef);
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        const documentId = doc.id;
        console.log('Dokument ID:', documentId);
        console.log('User Data:', userData);
        const loggedInListener = onSnapshot(doc.ref, (snapshot) => {
          const loggedInValue = snapshot.data()?.['loggedIn'];
          if (loggedInValue !== undefined) {
            if (loggedInValue) {
              console.log(`Benutzer ${userData.name} ist eingeloggt!`);
            } else {
              console.log(`Benutzer ${userData.name} ist ausgeloggt!`);
            }
          }

        });
      });

    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
  }


  async checkUserEmail() {
    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);
    this.isEmailExist = querySnapshot.docs.some((doc) => {
      const userData = doc.data() as User;
      return userData.email === this.user.email;
    });

    if (this.user.email === '' || !this.emailPattern.test(this.user.email) || this.isEmailExist) {
      this.isValidEmail = true;
      this.isEmailNotValid = true;
    } else {
      this.isValidEmail = false;
      this.isEmailNotValid = false;
    }
  }


  async checkUserPassword() {
    const collRef = collection(this.firestore, "users");
    const querySnapshot = await getDocs(collRef);
    this.isPasswordExist = querySnapshot.docs.some((doc) => {
      const userData = doc.data() as User;
      return userData.password === this.user.password;
    });

    if (this.user.password === '' || !this.passwordPattern.test(this.user.password) || this.isPasswordExist) {
      this.isValidPassword = true;
      this.isPasswordNotValid = true;
    } else {
      this.isValidPassword = false;
      this.isPasswordNotValid = false;
    }
  }


  checkUserName() {
    this.isName = this.namePattern.test(this.user.name);
    if (this.user.name === '' || !this.isName) {
      this.isValidName = true;
    } else {
      this.isValidName = false;
    }
  }


  saveCurrentUser() {
    let currentUser = {
      name: this.user.name,
      email: this.user.email,
      password: this.user.password
    };
    let currentBoolean = {
      isName: this.isName,
      isValidName: this.isValidEmail,
      isValidPassword: this.isValidPassword,
      isPasswordExist: this.isPasswordExist,
      isEmailExist: this.isEmailExist,
      isValidEmail: this.isValidEmail,
      isChecked: this.isChecked
    };
    this.accountService.currentUser.push(currentUser);
    this.accountService.currentBoolean.push(currentBoolean);

  }

}









