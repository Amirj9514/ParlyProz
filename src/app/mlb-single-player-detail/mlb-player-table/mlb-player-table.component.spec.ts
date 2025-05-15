import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlbPlayerTableComponent } from './mlb-player-table.component';

describe('MlbPlayerTableComponent', () => {
  let component: MlbPlayerTableComponent;
  let fixture: ComponentFixture<MlbPlayerTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MlbPlayerTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MlbPlayerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
