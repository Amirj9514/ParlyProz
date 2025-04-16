import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NhlSinglePlayerDetailComponent } from './nhl-single-player-detail.component';

describe('NhlSinglePlayerDetailComponent', () => {
  let component: NhlSinglePlayerDetailComponent;
  let fixture: ComponentFixture<NhlSinglePlayerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NhlSinglePlayerDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NhlSinglePlayerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
