import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NominalComparisonComponent } from './nominal-comparison.component';

describe('NominalComparisonComponent', () => {
  let component: NominalComparisonComponent;
  let fixture: ComponentFixture<NominalComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NominalComparisonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NominalComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
