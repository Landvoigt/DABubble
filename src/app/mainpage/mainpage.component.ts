import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ChannelServiceService } from '../channel-service.service';
import { ViewEncapsulation } from '@angular/core';
import { Subscription, debounceTime, fromEvent } from 'rxjs';
import { ScreenServiceService } from '../screen-service.service';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainpageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('leftSidenav', { static: false }) leftSidenav: MatSidenav;
  @ViewChild('rightSidenav', { static: false }) rightSidenav: MatSidenav;
  hoverCodeIcon: boolean = false;
  isLeftSidenavOpen: boolean = true;

  sidenavMode: 'over' | 'side' = 'side';
  showChat: boolean = true;
  resizeSubscription: Subscription;

  constructor(public channelService: ChannelServiceService, private cdRef: ChangeDetectorRef, private screenService: ScreenServiceService) {
    this.updateSidenavMode();
  }

  updateSidenavMode() {
    if (this.screenService.tabletMode) {
      this.sidenavMode = 'over';
    } else {
      this.sidenavMode = 'side';
    }
  }

  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  isRightSidenavActive(): boolean {
    return this.rightSidenav && this.rightSidenav.opened;
  }

  isLeftSidenavActive(): boolean {
    return this.leftSidenav && this.leftSidenav.opened;
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();

    this.resizeSubscription = fromEvent(window, 'resize').pipe(
      debounceTime(100)
    ).subscribe(() => this.updateSidenavMode());
  }

  /**
   * Toggles the visibility of the channels sidenav
   */
  toggleLeftSidenav() {
    this.leftSidenav.toggle();
    this.isLeftSidenavOpen = !this.isLeftSidenavOpen;

    if (this.screenService.tabletMode) {
      if (!this.showChat) {
        this.showChat = true;
      } else {
        this.showChat = false;
      }
    }
  }

  toggleChatInMobile() {
    this.showChat = true;
  }
}