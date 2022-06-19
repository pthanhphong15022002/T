import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxEpComponent } from './codx-ep.component';

describe('CodxEpComponent', () => {
  let component: CodxEpComponent;
  let fixture: ComponentFixture<CodxEpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxEpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxEpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
