// Ambient type declarations for packages that lack bundled type definitions.

// h5p-standalone ships dist/h5p.d.ts but has no "types" field in package.json.
// Declaring the module here lets TypeScript resolve the import while esbuild
// resolves the actual runtime bundle via the normal node_modules lookup.
declare module 'h5p-standalone' {
  export interface H5POptions {
    h5pJsonPath?: string;
    contentJsonPath?: string;
    librariesPath?: string;
    frameJs?: string;
    frameCss?: string;
    embedType?: 'iframe' | 'div';
    preventH5PInit?: boolean;
    title?: string;
    fullScreen?: boolean;
    copyright?: boolean;
    embed?: boolean;
    export?: boolean;
    frame?: boolean;
    icon?: boolean;
    copy?: boolean;
    postUserStatistics?: boolean;
    saveFreq?: number | false;
    downloadUrl?: string;
    embedCode?: string;
    resizeCode?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export class H5PStandalone {
    constructor(el: Element, options: H5POptions);
  }

  const _default: { H5P: typeof H5PStandalone };
  export default _default;
}
