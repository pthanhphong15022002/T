import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MACContentComponent } from './maccontent.component';

describe('MACContentComponent', () => {
  let component: MACContentComponent;
  let fixture: ComponentFixture<MACContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MACContentComponent]
    });
    fixture = TestBed.createComponent(MACContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
