import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemBatchsComponent } from './item-batchs.component';

describe('ItemBatchsComponent', () => {
  let component: ItemBatchsComponent;
  let fixture: ComponentFixture<ItemBatchsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ItemBatchsComponent]
    });
    fixture = TestBed.createComponent(ItemBatchsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
