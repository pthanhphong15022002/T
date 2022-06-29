import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PopupAddCategoryComponent } from './popup-add-category.component';

describe('EditCategoryComponent', () => {
  let component: PopupAddCategoryComponent;
  let fixture: ComponentFixture<PopupAddCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PopupAddCategoryComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupAddCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
