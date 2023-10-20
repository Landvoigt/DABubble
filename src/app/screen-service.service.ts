import { Injectable, OnDestroy } from '@angular/core';
import { Subscription, debounceTime, fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenServiceService implements OnDestroy {
  private resizeSubscription: Subscription;
  public tabletMode: boolean = window.innerWidth <= 920;
  public mobileMode: boolean = window.innerWidth <= 700;

  /**
   * Subscribes to screen size changing.
   */
  constructor() {
    this.resizeSubscription = fromEvent(window, 'resize').pipe(
      debounceTime(100)
    ).subscribe(() => this.checkWindowSize());
  }


  /**
   * Checks the screen size.
   */
  private checkWindowSize() {
    this.tabletMode = window.innerWidth <= 920;
    this.mobileMode = window.innerWidth <= 700;
  }


  /**
   * Destroys the active subscription.
   */
  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }
}
