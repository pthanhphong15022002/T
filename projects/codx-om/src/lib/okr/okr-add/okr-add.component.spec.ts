import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OkrAddComponent } from './okr-add.component';

describe('OkrAddComponent', () => {
  let component: OkrAddComponent;
  let fixture: ComponentFixture<OkrAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OkrAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OkrAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
