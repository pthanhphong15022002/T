import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopAddItemBatchsComponent } from './pop-add-item-batchs.component';

describe('PopAddItemBatchsComponent', () => {
  let component: PopAddItemBatchsComponent;
  let fixture: ComponentFixture<PopAddItemBatchsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PopAddItemBatchsComponent]
    });
    fixture = TestBed.createComponent(PopAddItemBatchsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
