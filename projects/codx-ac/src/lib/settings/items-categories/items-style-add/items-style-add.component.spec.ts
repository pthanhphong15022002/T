import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsStyleAddComponent } from './items-style-add.component';

describe('PopupAddItemStyleComponent', () => {
  let component: ItemsStyleAddComponent;
  let fixture: ComponentFixture<ItemsStyleAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemsStyleAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsStyleAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
