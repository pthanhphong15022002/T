import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashtransferAddComponent } from './cashtransfers-add.component';

describe('PopupAddCashTransferComponent', () => {
  let component: CashtransferAddComponent;
  let fixture: ComponentFixture<CashtransferAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashtransferAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashtransferAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
