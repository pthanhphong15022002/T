import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbxpopupComponent } from './cbxpopup.component';

describe('CbxpopupComponent', () => {
  let component: CbxpopupComponent;
  let fixture: ComponentFixture<CbxpopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CbxpopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CbxpopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
