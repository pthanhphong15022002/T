import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopupAddUpdate } from './popup-add-update.component';


describe('AddDetailNoteBooksComponent', () => {
  let component: PopupAddUpdate;
  let fixture: ComponentFixture<PopupAddUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddUpdate ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
