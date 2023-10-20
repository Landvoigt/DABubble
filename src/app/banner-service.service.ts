import { Injectable } from '@angular/core';
import { BehaviorSubject, tap, timer } from 'rxjs';

interface BannerContent {
  isVisible: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class BannerServiceService {
  private _bannerContent = new BehaviorSubject<BannerContent>({ isVisible: false, message: '' });
  bannerContent$ = this._bannerContent.asObservable();
  durationMs: number = 1800;

  /**
   * Updates the banner and shows it in the executed component.
   * @param message - The message to be displayed in the banner.
   */
  show(message: string): void {
    this._bannerContent.next({ isVisible: true, message });
    timer(this.durationMs).pipe(
      tap(() => this.hide())
    ).subscribe();
  }


  /**
   * Hides the banner.
   */
  hide(): void {
    this._bannerContent.next({ isVisible: false, message: '' });
  }
}
