import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProposedFieldComponent } from './add-proposed-field.component';

describe('AddProposedFieldComponent', () => {
  let component: AddProposedFieldComponent;
  let fixture: ComponentFixture<AddProposedFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddProposedFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProposedFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
