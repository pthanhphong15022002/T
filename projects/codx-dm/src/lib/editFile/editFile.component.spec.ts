import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFileComponent } from './editFile.component';

describe('EditFileComponent', () => {
  let component: EditFileComponent;
  let fixture: ComponentFixture<EditFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
