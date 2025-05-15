import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlbSinglePlayerDetailComponent } from './mlb-single-player-detail.component';

describe('MlbSinglePlayerDetailComponent', () => {
  let component: MlbSinglePlayerDetailComponent;
  let fixture: ComponentFixture<MlbSinglePlayerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MlbSinglePlayerDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MlbSinglePlayerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
