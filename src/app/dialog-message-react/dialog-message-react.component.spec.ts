import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogMessageReactComponent } from './dialog-message-react.component';

describe('DialogMessageReactComponent', () => {
  let component: DialogMessageReactComponent;
  let fixture: ComponentFixture<DialogMessageReactComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogMessageReactComponent]
    });
    fixture = TestBed.createComponent(DialogMessageReactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
