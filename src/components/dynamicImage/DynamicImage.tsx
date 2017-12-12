import * as React from 'react';
import { Observable, Subscription, Scheduler } from 'rxjs';

export const RGBAPixelSize = 4 * Uint8ClampedArray.BYTES_PER_ELEMENT;
export const DefaultRateLimit = 100;

export interface RGBAPixel {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface DynamicImageProps {
  width?: number;
  height?: number;
  rateLimit?: number;
}

export class DynamicImage extends React.Component<DynamicImageProps> {
  static defaultProps = {
    width: 1024,
    height: 768,
  };

  protected imageContext: CanvasRenderingContext2D | undefined | null;
  protected imageData: ImageData | undefined;
  protected subscription = Subscription.EMPTY;

  componentDidMount() {
    this.subscription = new Subscription();

    this.subscription.add(
      this.autoRepaint()
        .subscribe(x => {
          this.repaint();
        }),
    );

    const randomPixels = this.renderRandomPixels()
      .do(x => {
        this.setPixel(x.x, x.y, x.pixel, false);
      })
      .share();

    this.subscription.add(
      randomPixels
        .subscribe(),
    );

    this.subscription.add(
      randomPixels
        .bufferTime(1000)
        .scan(
          (a, x) => {
            return {
              rate: x.length,
              total: a.total + x.length,
            };
          },
          { rate: 0, total: 0 },
        )
        .subscribe(x => {
          // tslint:disable-next-line no-console
          console.debug(`${ x.rate } px/sec (${ x.total })`);
        }),
    );
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();

    this.subscription = Subscription.EMPTY;
  }

  render() {
    return (
      <canvas id='canvas' width={ this.props.width } height={ this.props.height }
        ref={ this.onRenderCanvas.bind(this) }
      />
    );
  }

  private renderRandomPixels() {
    return Observable
      .interval(0, Scheduler.asap)
      .map(() => {
        return {
          x: Math.floor(Math.random() * this.props.width!),
          y: Math.floor(Math.random() * this.props.height!),
          pixel: {
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256),
            a: 128 + Math.floor(Math.random() * 128),
          },
        };
      });
  }

  protected autoRepaint() {
    return Observable
      .timer(0, this.props.rateLimit || DefaultRateLimit);
  }

  protected onRenderCanvas(canvas: HTMLCanvasElement) {
    this.imageContext = canvas.getContext('2d');

    if (this.imageContext != null) {
      this.imageData = this.imageContext.createImageData(this.props.width!, this.props.height!);
    }
  }

  protected repaint() {
    if (this.imageContext != null && this.imageData != null) {
      this.imageContext.putImageData(this.imageData, 0, 0);
    }
  }

  protected setPixel(x: number, y: number, pixel: RGBAPixel, paint = false) {
    if (this.imageContext != null && this.imageData != null) {
      const index = this.getPixelIndex(x, y, this.imageData.width);

      this.imageData.data.set([ pixel.r, pixel.g, pixel.b, pixel.a ], index);

      if (paint) {
        this.imageContext.putImageData(this.imageData, 0, 0, x, y, 1, 1);
      }
    }
  }

  protected getPixelIndex(x: number, y: number, width: number) {
    return (x + y * width) * RGBAPixelSize;
  }
}
