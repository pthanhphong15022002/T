import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodxCreateIndexComponent } from './codx-create-index.component';

describe('CodxCreateIndexComponent', () => {
  let component: CodxCreateIndexComponent;
  let fixture: ComponentFixture<CodxCreateIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodxCreateIndexComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodxCreateIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
