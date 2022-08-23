import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlNoteComponent } from './control-note.component';

describe('ControlNoteComponent', () => {
  let component: ControlNoteComponent;
  let fixture: ComponentFixture<ControlNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
