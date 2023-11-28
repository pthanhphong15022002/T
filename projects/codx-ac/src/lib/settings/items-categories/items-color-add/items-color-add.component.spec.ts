import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsColorAddComponent } from './items-color-add.component';

describe('PopupAddItemColorComponent', () => {
  let component: ItemsColorAddComponent;
  let fixture: ComponentFixture<ItemsColorAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemsColorAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsColorAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
