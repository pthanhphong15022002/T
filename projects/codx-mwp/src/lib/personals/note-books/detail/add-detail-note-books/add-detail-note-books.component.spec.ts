import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDetailNoteBooksComponent } from './add-detail-note-books.component';

describe('AddDetailNoteBooksComponent', () => {
  let component: AddDetailNoteBooksComponent;
  let fixture: ComponentFixture<AddDetailNoteBooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDetailNoteBooksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDetailNoteBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
