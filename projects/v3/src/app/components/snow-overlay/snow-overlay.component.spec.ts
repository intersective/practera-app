import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SnowOverlayComponent } from './snow-overlay.component';

describe('SnowOverlayComponent', () => {
  let component: SnowOverlayComponent;
  let fixture: ComponentFixture<SnowOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnowOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SnowOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate snowflakes on init', () => {
    expect(component.snowflakes.length).toBeGreaterThan(0);
  });

  it('should have snowflakes with valid properties', () => {
    const flake = component.snowflakes[0];
    expect(flake.id).toBeDefined();
    expect(flake.size).toBeGreaterThanOrEqual(4);
    expect(flake.size).toBeLessThanOrEqual(10);
    expect(flake.left).toBeGreaterThanOrEqual(0);
    expect(flake.left).toBeLessThanOrEqual(100);
    expect(flake.delay).toBeGreaterThanOrEqual(0);
    expect(flake.delay).toBeLessThanOrEqual(10);
    expect(flake.duration).toBeGreaterThanOrEqual(8);
    expect(flake.duration).toBeLessThanOrEqual(15);
    expect(flake.opacity).toBeGreaterThanOrEqual(0.4);
    expect(flake.opacity).toBeLessThanOrEqual(1);
  });

  it('should have aria-hidden on overlay container', () => {
    const overlay = fixture.nativeElement.querySelector('.snow-overlay');
    expect(overlay.getAttribute('aria-hidden')).toBe('true');
  });

  it('should have pointer-events none for non-blocking interaction', () => {
    const overlay = fixture.nativeElement.querySelector('.snow-overlay');
    const styles = getComputedStyle(overlay);
    expect(styles.pointerEvents).toBe('none');
  });

  it('should render correct number of snowflake elements', () => {
    const snowflakeElements = fixture.nativeElement.querySelectorAll('.snowflake');
    expect(snowflakeElements.length).toBe(component.snowflakes.length);
  });

  it('trackByFlakeId should return flake id', () => {
    const flake = { id: 5 };
    expect(component.trackByFlakeId(0, flake)).toBe(5);
  });
});
