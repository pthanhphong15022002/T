import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabDetailCustomComponent } from './tab-detail-custom.component';

describe('TabDetailCustomComponent', () => {
  let component: TabDetailCustomComponent;
  let fixture: ComponentFixture<TabDetailCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabDetailCustomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabDetailCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
