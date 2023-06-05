import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabCaseDetailComponent } from './tab-cases-detail.component';

describe('TabCaseDetailComponent', () => {
  let component: TabCaseDetailComponent;
  let fixture: ComponentFixture<TabCaseDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabCaseDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabCaseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
