import * as React from 'react';
import { Observable, Subscription, Scheduler } from 'rxjs';

import { IotaGram, IotaGramPixelPayload, Point2D, RGBAPixelSize } from '../../lib';

export const DefaultRateLimit = 100;

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
  protected iotaGram: IotaGram | undefined;
  protected subscription = Subscription.EMPTY;

  componentDidMount() {
    this.subscription = new Subscription();
    this.iotaGram = new IotaGram('http://node.lukaseder.de:14265', 'QPM9ZSUPIJKPYFYUWESXLHEKMUJZ9TLBDWUTPZGOMMDAFEFBWXAYBTIEYOAUR9UYEYKQDP9MYQYOBCQLAEJLVDWRBW');

    this.subscription.add(
      this.iotaGram.datagrams
        .subscribe(
          x => {
            if (x.payload != null) {
              this.setPixel(x.payload, true);
            }
          },
          e => {
            // tslint:disable-next-line no-console
            console.error(e);
          },
        ),
    );

    this.subscription.add(
      this.autoRepaint()
        .subscribe(
          x => {
            this.repaint();
          },
          e => {
            // tslint:disable-next-line no-console
            console.error(e);
          },
        ),
    );

    const randomPixels = this.renderRandomPixels()
      .do(x => {
        this.setPixel(x, false);
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
              start: a.start,
            };
          },
          { rate: 0, total: 0, start: new Date() },
        )
        .do(x => {
          let duration = (new Date().getTime() - x.start.getTime()) / 1000;
          const seconds = duration % 60;
          duration /= 60;
          const minutes = duration % 60;
          const hours = duration / 60;

          const len = `${ Math.floor(hours) }:${ minutes < 10 ? '0' : '' }${ Math.floor(minutes) }:${ seconds < 10 ? '0' : '' }${ Math.floor(seconds) }`;

          // tslint:disable-next-line no-console
          console.debug(`${ x.rate } px/sec (${ x.total } over ${ len }, ${ (x.total / seconds).toFixed(2) } px/sec)`);
        })
        .subscribe(),
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

  private renderRandomPixels(): Observable<IotaGramPixelPayload> {
    return Observable
      .interval(0, Scheduler.asap)
      .take(0)
      .map(() => {
        return {
          location: {
            x: Math.floor(Math.random() * this.props.width!),
            y: Math.floor(Math.random() * this.props.height!),
          },
          color: {
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

  protected setPixel(data: IotaGramPixelPayload, paint = false) {
    if (this.imageContext != null && this.imageData != null) {
      const index = this.getPixelIndex(data.location, this.imageData.width);

      this.imageData.data.set([ data.color.r, data.color.g, data.color.b, data.color.a || 255 ], index);

      if (paint) {
        this.imageContext.putImageData(this.imageData, 0, 0, data.location.x, data.location.y, 1, 1);
      }
    }
  }

  protected getPixelIndex(location: Point2D, width: number) {
    return (location.x + location.y * width) * RGBAPixelSize;
  }
}
