import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovelHrComponent } from './approvel-hr.component';

describe('ApprovelHrComponent', () => {
  let component: ApprovelHrComponent;
  let fixture: ComponentFixture<ApprovelHrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprovelHrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovelHrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
