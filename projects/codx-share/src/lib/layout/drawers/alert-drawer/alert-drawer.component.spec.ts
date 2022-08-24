import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertDrawerComponent } from './alert-drawer.component';

describe('AlertDrawerComponent', () => {
  let component: AlertDrawerComponent;
  let fixture: ComponentFixture<AlertDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertDrawerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
