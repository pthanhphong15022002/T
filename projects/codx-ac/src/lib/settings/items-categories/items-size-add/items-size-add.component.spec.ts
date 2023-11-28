import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsSizeAddComponent } from './items-size-add.component';

describe('PopupAddItemSizeComponent', () => {
  let component: ItemsSizeAddComponent;
  let fixture: ComponentFixture<ItemsSizeAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemsSizeAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsSizeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
