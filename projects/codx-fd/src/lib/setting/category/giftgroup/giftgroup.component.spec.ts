import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftgroupComponent } from './giftgroup.component';

describe('GiftgroupComponent', () => {
  let component: GiftgroupComponent;
  let fixture: ComponentFixture<GiftgroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GiftgroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GiftgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
