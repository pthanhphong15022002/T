import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OkrEditComponent } from './okr-edit.component';

describe('OkrEditComponent', () => {
  let component: OkrEditComponent;
  let fixture: ComponentFixture<OkrEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OkrEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OkrEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
