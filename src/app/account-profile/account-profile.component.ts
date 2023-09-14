import { Component, OnInit } from '@angular/core';
import { AccountServiceService } from '../account-service.service';
import { Location } from '@angular/common';
import { User } from 'src/models/user.class';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { Router } from '@angular/router';


@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss']
})
export class AccountProfileComponent  {
  imageUrl: string | null = null;
  user = new User();
  private storage = getStorage();
  filePath: any;
  isCreated = false;
  isNotChoose = true;


  avatars: any = [
    'avatar_1.png',
    'avatar_big.png',
    'avatar_small.png'
  ];
  imagePath = './assets/img/none-profile.png';
  isIntro = true;
  name: string = '';

  constructor(private accountService: AccountServiceService,
    private location: Location,private router: Router) {
    this.isIntro = accountService.isIntro;
    this.name = this.accountService.currentUser[0].name;
  }


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
      console.log('Bild-URL als profile in Firestore:', this.user.avatarSrc);
      this.isNotChoose = false;
    } catch (error) {
      console.error('Fehler beim Hochladen und Auslesen des Bildes:', error);
    }

  }


async chooseAvatar(i: any) {
    try {
      // Annahme: this.avatars ist eine Liste von Dateinamen in assets/img/
      const fileName = this.avatars[i];
      const filePath = `${fileName}`;
      const fileRef = ref(this.storage, filePath);
      const imageBlob = await fetch(`./assets/img/${fileName}`).then((response) => response.blob());
      const uploadTask = uploadBytesResumable(fileRef, imageBlob);
      await uploadTask;
      this.imagePath = await getDownloadURL(fileRef);
      this.accountService.imagePathService = this.imagePath;
      this.isNotChoose = false;
      console.log('Bild-URL:', this.imagePath);
      console.log('Bild-URL als profile in Firestore:', this.user.avatarSrc);
    } catch (error) {
      console.error('Fehler beim Hochladen und Auslesen des Bildes:', error);
    }
  }


checkIntro() {
    this.isCreated = true;
    setTimeout(() => {
      this.isCreated = false;
      this.router.navigate(['/']);
    }, 1500);
    this.sendingForm();
    this.accountService.currentUser = [];
    this.accountService.currentBoolean = [];
    this.accountService.isIntro = false;
  }


  goBack() {  // test
    this.location.back();
  }

  goForward() {   // test
    this.location.forward();
  }

  sendingForm() {
    // hier wird   boolean Variable auf true gesetzt
    this.accountService.setMeinBoolean(true);
  }




}
