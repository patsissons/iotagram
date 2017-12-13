import { Plugin } from 'webpack';

export = FaviconsWebpackPlugin;

declare class FaviconsWebpackPlugin extends Plugin {
	constructor(options?: FaviconsWebpackPlugin.Options | string);
}

declare namespace FaviconsWebpackPlugin {
  interface IconOptions {
    android?: boolean;
    appleIcon?: boolean;
    appleStartup?: boolean;
    coast?: boolean;
    favicons?: boolean;
    firefox?: boolean;
    opengraph?: boolean;
    twitter?: boolean;
    yandex?: boolean;
    windows?: boolean;
  }

  interface Options {
    logo?: string;
    prefix?: string;
    emitStats?: boolean;
    statsFileName?: string;
    persistentCache?: boolean;
    inject?: boolean;
    background?: string;
    title?: string;
    icons?: IconOptions;
  }
}
