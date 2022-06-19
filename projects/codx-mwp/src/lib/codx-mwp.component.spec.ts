import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxMwpComponent } from './codx-mwp.component';

describe('CodxMwpComponent', () => {
  let component: CodxMwpComponent;
  let fixture: ComponentFixture<CodxMwpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxMwpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxMwpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
