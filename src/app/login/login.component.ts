import { ChangeDetectorRef, Component, inject } from '@angular/core';
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
export class LoginComponent {
  isIntro = true;
  user = new User();
  firestore: Firestore = inject(Firestore);

  constructor(public accountService: AccountServiceService, private router: Router, private ref: ChangeDetectorRef) {
    this.isIntro = accountService.isIntro;
    //this.accountService.getLoggedUsers();
  }

  checkIntro() {
    this.isIntro = false;
  }

  async login() {
    const email = this.user.email; // E-Mail-Adresse aus dem Eingabefeld
    const password = this.user.password; // Passwort aus dem Eingabefeld

    if (email && password) {
      // Überprüfen, ob beide Eingabefelder ausgefüllt sind

      const collRef = collection(this.firestore, "users");
      const querySnapshot = await getDocs(collRef);

      let userFound = false; // Eine Flagge, um zu überprüfen, ob der Benutzer gefunden wurde

      querySnapshot.forEach(async (queryDocSnapshot) => {
        const userData = queryDocSnapshot.data() as User;

        if (userData.email === email) {
          // Wenn die E-Mail-Adresse in der Datenbank gefunden wurde
          userFound = true;

          // Überprüfe das Passwort
          if (userData.password === password) {
            // Das Passwort stimmt überein, der Benutzer ist erfolgreich angemeldet
            console.log('Erfolgreich angemeldet:', userData);

            // Das Firestore-Dokument aktualisieren, um loggedIn auf true zu setzen
            const userDocRef = doc(this.firestore, 'user', queryDocSnapshot.id);
            await updateDoc(userDocRef, {
              loggedIn: true
            });

            // Daten des Benutzers aus Firestore abrufen
            const userDoc = await getDoc(userDocRef);
            const updatedUserData = userDoc.data() as User;

            // Ausloggen der Benutzerdaten auf die Konsole ausgeben
            console.log('Benutzerdaten nach dem Einloggen:', updatedUserData);

            // Füge die Benutzerdaten dem JSON-Array in der Serviceklasse hinzu

          } else {
            // Das Passwort stimmt nicht überein
            console.log('Falsches Passwort');
          }
        }
      });

      if (!userFound) {
        // Der Benutzer mit der angegebenen E-Mail-Adresse wurde nicht gefunden
        console.log('Benutzer ist nicht vorhanden!');
      }
    } else {
      // Wenn nicht beide Eingabefelder ausgefüllt sind
      console.log('Bitte füllen Sie beide Eingabefelder aus.');
    }
  }
}