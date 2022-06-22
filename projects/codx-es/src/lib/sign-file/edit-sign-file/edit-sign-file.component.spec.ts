import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSignFileComponent } from './edit-sign-file.component';

describe('EditSignFileComponent', () => {
  let component: EditSignFileComponent;
  let fixture: ComponentFixture<EditSignFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSignFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSignFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
