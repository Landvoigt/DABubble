import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
import { User } from 'src/models/user.class';
import { NgForm } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { AccountServiceService } from '../account-service.service';
import { query, QuerySnapshot, where } from 'firebase/firestore';


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
  }

  formAction() {
    this.submitForm();
    console.log('Die Funktion wurde automatisch ausgeführt.');
  }




  constructor(public accountService: AccountServiceService) {

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
      const newUserDocRef = doc(collRef);
      await setDoc(newUserDocRef, {
        name: this.user.name,
        email: this.user.email,
        password: this.user.password,
        loggedIn: false,
        isActive: false,
        chanel: '',
        profile: this.accountService.imagePathService
      });
      userForm.resetForm();
      this.isValidName = true;
      this.isValidEmail = true;
      this.isValidPassword = true;
      this.isChecked = false;

    }
  }


  async getUsersFirestore() {
    const collRef = collection(this.firestore, "users");

    // Rufe alle Dokumente in der Sammlung "user" ab und warte auf das Ergebnis
    const querySnapshot = await getDocs(collRef);

    // Durchlaufe jedes Dokument in der Abfrageergebnis-Sammlung
    querySnapshot.forEach((doc) => {
      // Rufe die Benutzerdaten aus dem aktuellen Dokument ab und interpretiere sie als "User"-Objekt
      const userData = doc.data() as User;

      // Rufe die eindeutige ID des aktuellen Dokuments ab
      const documentId = doc.id;

      // Gib die eindeutige ID und die Benutzerdaten auf der Konsole aus
      console.log('Dokument ID:', documentId);
      console.log('User Data:', userData);
    });

    //console.log('ennyi felhasznalo van: ', (await this.getNumberOfUsers()).toString());
    // console.log('Anzahl der Benutzer:', Number(await this.getNumberOfUsers()));
    // this.numberOfUsers = Number(await this.getNumberOfUsers());
    // console.log('Slack-Benutzer: ',this.numberOfUsers);


  }





  async getUsers() {
    const collRef = collection(this.firestore, "users");

    try {
      // Führe eine Abfrage durch, um nur Dokumente mit userId === 5 zu erhalten
      const querySnapshot = await getDocs(query(collRef, where("userId", "==", 5)));

      // Durchlaufe die Ergebnisse der Abfrage
      querySnapshot.forEach((doc) => {
        // Rufe die Benutzerdaten aus dem aktuellen Dokument ab und interpretiere sie als "User"-Objekt
        const userData = doc.data() as User;

        // Rufe die eindeutige ID des aktuellen Dokuments ab
        const documentId = doc.id;
        console.log('Dokument ID:', documentId);
        console.log('User Data:', userData);
        // Erstelle ein div-Element, um die Benutzerdaten anzuzeigen
        const userDiv = document.createElement("div");

        // Füge die Benutzerdaten dem div-Element hinzu (angepasst an deine Datenstruktur)
        userDiv.innerHTML = `
          <p>Document ID: ${documentId}</p>
          <p>Name: ${userData.name}</p>
          <p>Email: ${userData.email}</p>
          <p>Password: ${userData.password}</p>
          <img id="profileImg" src="${userData.profile}">
        `;

        // Füge das div-Element zum DOM hinzu, um die Benutzerdaten anzuzeigen
        document.body.appendChild(userDiv);
      });
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    }
    //this.accountService.getLoggedUsers();
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
    } else {
      this.isValidEmail = false;
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
    } else {
      this.isValidPassword = false;
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









