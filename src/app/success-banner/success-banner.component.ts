import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-success-banner',
  template: `
    <div class="success-banner">
      <img src="{{ src }}"> 
      <span>{{ message }}</span>
    </div>
  `,
  styles: [`
    .success-banner {
      padding: 50px;
      background-color: #444DF2;
      color: white;
      border-radius: 30px;
      display: flex;
      gap: 10px;
      font-size: 36px;
      font-weight: 600;
    }
  `]
})
export class SuccessBannerComponent {
  @Input() message: string;
  @Input() src: string;
}
