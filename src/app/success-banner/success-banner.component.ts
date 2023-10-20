import { Component, Input, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-success-banner',
  templateUrl: './success-banner.component.html',
  styleUrls: ['./success-banner.component.scss'],
  animations: [
    trigger('slideFade', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('225ms', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 })),
      ])
    ])
  ]
})
export class SuccessBannerComponent implements OnInit, OnDestroy {
  @Input() message: string;
  @HostBinding('@slideFade') animate = true;
  private timeoutId: any;


  /**
   * Sets a timer for the banner to be shown.
   */
  ngOnInit(): void {
    this.timeoutId = setTimeout(() => this.animate = false, 2500);
  }


  /**
   * Clears the timeout.
   */
  ngOnDestroy(): void {
    clearTimeout(this.timeoutId);
  }
}