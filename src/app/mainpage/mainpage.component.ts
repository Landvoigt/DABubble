import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ChannelServiceService } from '../channel-service.service';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.scss'],
})
export class MainpageComponent implements OnInit {
  @ViewChild('leftSidenav') leftSidenav!: MatSidenav;
  @ViewChild('rightSidenav') rightSidenav!: MatSidenav;
  hoverCodeIcon: boolean = false;
  isSidenavOpen: boolean = true;

  constructor(public channelService: ChannelServiceService) { }

  ngOnInit(): void {
  }

  toggleLeftSidenav() {
    this.leftSidenav.toggle();
    this.isSidenavOpen = !this.isSidenavOpen;
  }
}