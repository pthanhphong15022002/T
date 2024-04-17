import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupMyteamReponsiveComponent } from './popup-myteam-reponsive.component';

describe('PopupMyteamReponsiveComponent', () => {
  let component: PopupMyteamReponsiveComponent;
  let fixture: ComponentFixture<PopupMyteamReponsiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopupMyteamReponsiveComponent]
    });
    fixture = TestBed.createComponent(PopupMyteamReponsiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
