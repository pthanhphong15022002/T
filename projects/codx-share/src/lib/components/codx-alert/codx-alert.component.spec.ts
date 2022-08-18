import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxAlertComponent } from './codx-alert.component';

describe('CodxAlertComponent', () => {
  let component: CodxAlertComponent;
  let fixture: ComponentFixture<CodxAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxAlertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
