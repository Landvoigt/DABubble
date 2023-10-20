import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ChannelServiceService } from '../channel-service.service';
import { ViewEncapsulation } from '@angular/core';
import { Subscription, debounceTime, fromEvent } from 'rxjs';
import { ScreenServiceService } from '../screen-service.service';
import { BannerServiceService } from '../banner-service.service';
import { AccountServiceService } from '../account-service.service';
import { User } from 'src/models/user.class';
import { ChatServiceService } from '../chat-service.service';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MainpageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('leftSidenav', { static: false }) leftSidenav: MatSidenav;
  @ViewChild('rightSidenav', { static: false }) rightSidenav: MatSidenav;

  resizeSubscription: Subscription;
  bannerSubscription: Subscription;

  hoverCodeIcon: boolean = false;
  isLeftSidenavOpen: boolean = true;
  sidenavMode: 'over' | 'side' = 'side';

  showChat: boolean = true;
  isBannerVisible: boolean = false;
  bannerMsg: string = '';

  constructor(
    public channelService: ChannelServiceService,
    private cdRef: ChangeDetectorRef,
    private screenService: ScreenServiceService,
    private bannerService: BannerServiceService,
    private accountService: AccountServiceService,
    public chatService: ChatServiceService) {
    this.updateSidenavMode();
    this.initializeBanner();
    this.accountService.checkUserActivity(this.accountService.getLoggedInUser() as User);
  }


  /**
   * Detects changes and subscribes to window resize events, updating the sidenav mode accordingly.
   */
  ngAfterViewInit(): void {
    this.cdRef.detectChanges();

    this.resizeSubscription = fromEvent(window, 'resize').pipe(
      debounceTime(100)
    ).subscribe(() => this.updateSidenavMode());
  }


  /**
   * Updates the sidenav mode based on screen size.
   * Sets the sidenav mode to 'over' when in tablet mode and 'side' otherwise.
   */
  updateSidenavMode(): void {
    if (this.screenService.tabletMode) {
      this.sidenavMode = 'over';
    } else {
      this.sidenavMode = 'side';
    }
  }


  /**
   * Subscribes to changes for the banner to show them when called.
   */
  initializeBanner(): void {
    this.bannerSubscription = this.bannerService.bannerContent$.subscribe(
      bannerMessage => {
        this.isBannerVisible = bannerMessage.isVisible;
        this.bannerMsg = bannerMessage.message;
      }
    );
  }


  /**
   * Checks if the right side threads component is active.
   * @returns {boolean} - True if right side navigation menu is active, false otherwise.
   */
  isRightSidenavActive(): boolean {
    return this.rightSidenav && this.rightSidenav.opened;
  }


  /**
   * Checks if the left side navigation menu is active.
   * @returns {boolean} - True if left side navigation menu is active, false otherwise.
   */
  isLeftSidenavActive(): boolean {
    return this.leftSidenav && this.leftSidenav.opened;
  }


  /**
   * Toggles the visibility of the channels sidenav
  */
  toggleLeftSidenav(): void {
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


  /**
   * Toggles the chat visibility for mobiles to true.
   */
  toggleChatInMobile(): void {
    this.showChat = true;
  }


  /**
   * Unsubscribes from the resizeSubscription upon component destruction to prevent memory leaks.
   */
  ngOnDestroy(): void {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
    if (this.bannerSubscription) {
      this.bannerSubscription.unsubscribe();
    }
  }
}