import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxJsonformatterComponent } from './codx-jsonformatter.component';

describe('CodxJsonformatterComponent', () => {
  let component: CodxJsonformatterComponent;
  let fixture: ComponentFixture<CodxJsonformatterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxJsonformatterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodxJsonformatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
