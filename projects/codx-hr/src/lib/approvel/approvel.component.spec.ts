import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovelComponent } from './approvel.component';

describe('ApprovelComponent', () => {
  let component: ApprovelComponent;
  let fixture: ComponentFixture<ApprovelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApprovelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
