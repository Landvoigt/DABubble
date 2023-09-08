import { Component, OnInit } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { Location } from '@angular/common';
import { User } from 'src/models/user.class';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";


@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss']
})
export class AccountProfileComponent implements OnInit {
  imageUrl: string | null = null;
  user = new User();
  private storage = getStorage();
  // private storageFB: FirebaseStorage
  filePath: any;



  avatars: any = [
    'avatar_1.png',
    'avatar_big.png',
    'avatar_small.png'
  ];
  imagePath = './assets/img/none-profile.png';
  isIntro = true;
  name: string = '';

  constructor(private accountService: AccountServiceService,
    private location: Location) {
    this.isIntro = accountService.isIntro;
    this.name = this.accountService.currentUser[0].name;
  }


  // uploadImage(event: any) {
  //   const file = event.target.files[0];
  //   const filePath = `images/${file.name}`;
  //   const fileRef = this.storage.ref(filePath);
  //   const uploadTask = this.storage.upload(filePath, file);

  //   uploadTask.snapshotChanges().pipe(
  //     finalize(() => {
  //       fileRef.getDownloadURL().subscribe(url => {
  //         this.imageUrl = url;
  //       });
  //     })
  //   ).subscribe();


  // }




  // uploadImage(event: any) {
  //   const file = event.target.files[0];
  //   this.filePath = `${this.accountService.currentUser[0]['userId']}/${file.name}`; // `${this.accountService.currentUser[0]['email']}/${file.name}` oder ; this.accountService.currentUser[0]['email']
  //   const fileRef = ref(this.storage, this.filePath);
  //   const uploadTask = uploadBytesResumable(fileRef, file);

  //   uploadTask.then(snapshot => {
  //     getDownloadURL(snapshot.ref).then(url => {
  //       this.imagePath = url;
  //     }).catch(error => {
  //       console.error('Fehler beim Abrufen der Download-URL:', error);
  //     });
  //   }).catch(error => {
  //     console.error('Fehler beim Hochladen der Datei:', error);
  //   });

  // }


  async uploadImage(event: any) {
    try {
      const file = event.target.files[0];
      const filePath = `${file.name}`;
      const fileRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(fileRef, file);
      const snapshot = await uploadTask;
      this.imagePath = await getDownloadURL(snapshot.ref);
      this.accountService.imagePathService = this.imagePath;
      console.log('Bild-URL:', this.imagePath);
      console.log('Bild-URL als profile in Firestore:', this.user.profile);
    } catch (error) {
      console.error('Fehler beim Hochladen und Auslesen des Bildes:', error);
    }

  }



  async chooseAvatar(i: any) {
    try {
      // Annahme: this.avatars ist eine Liste von Dateinamen in assets/img/
      const fileName = this.avatars[i];
      const filePath = `${fileName}`;
      const fileRef = ref(this.storage, filePath); // Verwende ref aus Firebase Storage

      // Lade das Bild aus dem lokalen assets-Ordner
      const imageBlob = await fetch(`./assets/img/${fileName}`).then((response) => response.blob());

      // Lade das Bild in Firebase Storage hoch
      const uploadTask = uploadBytesResumable(fileRef, imageBlob);
      await uploadTask;

      // Hole die herunterladbare URL des hochgeladenen Bildes
      this.imagePath = await getDownloadURL(fileRef);

      // Speichere die Bild-URL in deinem Service (z. B. accountService)
      this.accountService.imagePathService = this.imagePath;

      console.log('Bild-URL:', this.imagePath);
      console.log('Bild-URL als profile in Firestore:', this.user.profile);
    } catch (error) {
      console.error('Fehler beim Hochladen und Auslesen des Bildes:', error);
    }
  }




  // chooseAvatar(i: any) {
  //   this.imagePath = `./assets/img/${this.avatars[i]}`;
  //   this.filePath = this.imagePath;
  //   const fileRef = ref(this.storage, this.avatars[i]);
  //   uploadBytesResumable(fileRef, this.filePath);
  // }





  checkIntro() {
    this.sendingForm();
    this.accountService.currentUser = [];
    this.accountService.currentBoolean = [];
    this.accountService.isIntro = false;
  }

  goBack() {
    this.location.back();
  }

  goForward() {
    this.location.forward();
  }

  ngOnInit(): void {

  }


  sendingForm() {
    // hier wird   boolean Variable auf true gesetzt
    this.accountService.setMeinBoolean(true);
  }




}
