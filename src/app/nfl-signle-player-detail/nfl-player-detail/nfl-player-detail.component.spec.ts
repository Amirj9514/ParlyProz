import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NflPlayerDetailComponent } from './nfl-player-detail.component';

describe('NflPlayerDetailComponent', () => {
  let component: NflPlayerDetailComponent;
  let fixture: ComponentFixture<NflPlayerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NflPlayerDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NflPlayerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
