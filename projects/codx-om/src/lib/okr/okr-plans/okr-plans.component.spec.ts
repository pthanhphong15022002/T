import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OkrPlansComponent } from './okr-plans.component';

describe('OkrAddComponent', () => {
  let component: OkrPlansComponent;
  let fixture: ComponentFixture<OkrPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OkrPlansComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OkrPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
