import { TrafficLightComponent } from './traffic-light.component';

describe('TrafficLightComponent', () => {
  let component: TrafficLightComponent;

  beforeEach(() => {
    component = new TrafficLightComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return grey when value is null', () => {
    component.value = null;

    expect(component.color).toBe('grey');
  });

  it('should return grey when value is undefined', () => {
    component.value = undefined as any;

    expect(component.color).toBe('grey');
  });

  it('should return red when value is less than 0.32', () => {
    component.value = 0.31;

    expect(component.color).toBe('red');
  });

  it('should return green when value is greater than 0.65', () => {
    component.value = 0.66;

    expect(component.color).toBe('green');
  });

  it('should return orange when value is in threshold range', () => {
    component.value = 0.5;

    expect(component.color).toBe('orange');
  });

  it('should return orange at exact lower and upper thresholds', () => {
    component.value = 0.32;
    expect(component.color).toBe('orange');

    component.value = 0.65;
    expect(component.color).toBe('orange');
  });
});
