import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashtransfersComponent } from './cashtransfers.component';

describe('CashTransfersComponent', () => {
  let component: CashtransfersComponent;
  let fixture: ComponentFixture<CashtransfersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashtransfersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashtransfersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
