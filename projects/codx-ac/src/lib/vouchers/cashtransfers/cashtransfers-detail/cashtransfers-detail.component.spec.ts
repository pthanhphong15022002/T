import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashtransfersDetailComponent } from './cashtransfers-detail.component';

describe('CashtransfersDetailComponent', () => {
  let component: CashtransfersDetailComponent;
  let fixture: ComponentFixture<CashtransfersDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CashtransfersDetailComponent]
    });
    fixture = TestBed.createComponent(CashtransfersDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
