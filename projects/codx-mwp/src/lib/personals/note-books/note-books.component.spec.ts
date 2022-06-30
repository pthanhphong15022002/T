import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteBooksComponent } from './note-books.component';

describe('NoteBooksComponent', () => {
  let component: NoteBooksComponent;
  let fixture: ComponentFixture<NoteBooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoteBooksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
