import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NominalComparisonToastComponent } from './nominal-comparison-toast.component';

describe('NominalComparisonToastComponent', () => {
  let component: NominalComparisonToastComponent;
  let fixture: ComponentFixture<NominalComparisonToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NominalComparisonToastComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NominalComparisonToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
