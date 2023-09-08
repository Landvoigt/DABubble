import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainpageChannelsComponent } from './mainpage-channels.component';

describe('MainpageChannelsComponent', () => {
  let component: MainpageChannelsComponent;
  let fixture: ComponentFixture<MainpageChannelsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MainpageChannelsComponent]
    });
    fixture = TestBed.createComponent(MainpageChannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
