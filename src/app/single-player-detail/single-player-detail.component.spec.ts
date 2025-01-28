import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SinglePlayerDetailComponent } from './single-player-detail.component';

describe('SinglePlayerDetailComponent', () => {
  let component: SinglePlayerDetailComponent;
  let fixture: ComponentFixture<SinglePlayerDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SinglePlayerDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SinglePlayerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
