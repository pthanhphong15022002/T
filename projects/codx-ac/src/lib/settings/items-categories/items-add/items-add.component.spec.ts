import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsAddComponent } from './items-add.component';

describe('PopupAddItemComponent', () => {
  let component: ItemsAddComponent;
  let fixture: ComponentFixture<ItemsAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemsAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
