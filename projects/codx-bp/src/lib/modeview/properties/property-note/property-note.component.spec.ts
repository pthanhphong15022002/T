import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyNoteComponent } from './property-note.component';

describe('PropertyNoteComponent', () => {
  let component: PropertyNoteComponent;
  let fixture: ComponentFixture<PropertyNoteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PropertyNoteComponent]
    });
    fixture = TestBed.createComponent(PropertyNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
