import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.scss'],
})
export class MainpageComponent implements OnInit {
  @ViewChild('leftSidenav') leftSidenav!: MatSidenav;
  @ViewChild('rightSidenav') rightSidenav!: MatSidenav;
  firestore: Firestore = inject(Firestore);
  hoverCodeIcon: boolean = false;
  isSidenavOpen: boolean = true;

  ngOnInit(): void {
  }

  toggleLeftSidenav() {
    this.leftSidenav.toggle();
    this.isSidenavOpen = !this.isSidenavOpen;
  }

  toggleRightSidenav() {
    this.rightSidenav.toggle();
  }

  openRightSidenav() {
    this.rightSidenav.open();
  }
}