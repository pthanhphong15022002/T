import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupViewAllComponent } from './popup-view-all.component';

describe('PopupViewAllComponent', () => {
  let component: PopupViewAllComponent;
  let fixture: ComponentFixture<PopupViewAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupViewAllComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupViewAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
