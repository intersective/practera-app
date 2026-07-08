import { Injectable, Output } from '@angular/core';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// const baseURL = "/assets/ffmpeg";
const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  private ffmpeg: FFmpeg;
  private isLoaded = false;
  videoURL = "";
  message = "";

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  isFfmpegLoaded(): boolean {
    return this.isLoaded;
  }

  async loadFFmpeg(): Promise<void> {
    this.ffmpeg.on("log", ({ message }) => {
      this.message = message;
    });
    // eslint-disable-next-line no-console
    console.log('loadFFmpeg::', new URL(`/assets/ffmpeg/worker.js`, window.location.origin).toString());

    await this.ffmpeg.load({
      // coreURL: `${baseURL}/ffmpeg-core.js`,
      // coreURL: new URL(`assets/ffmpeg/ffmpeg-core.js`, window.location.origin).toString(),
      // wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      // wasmURL: new URL(`assets/ffmpeg/ffmpeg-core.wasm`, window.location.origin).toString(),
      // workerURL: `${baseURL}/ffmpeg-core.worker.js`,
      classWorkerURL: new URL(`assets/ffmpeg/worker.js`, window.location.origin).toString(),
      // classWorkerURL: new URL(`assets/ffmpeg/worker.js`, window.location.origin).toString(),
      // coreURL: `${baseURL}/ffmpeg-core.js`,
      // wasmURL: `${baseURL}/ffmpeg-core.wasm`,
      // workerURL: `${baseURL}/ffmpeg-core.worker.js`,
    });
    this.isLoaded = true;
  }

  async transcode(videoURL = "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/video-15s.avi"): Promise<Blob> {
    // eslint-disable-next-line no-console
    console.info(videoURL);

    await this.ffmpeg.writeFile("input.avi", await fetchFile(videoURL));
    await this.ffmpeg.exec(["-i", "input.avi", "output.mp4"]);
    const fileData = await this.ffmpeg.readFile('output.mp4');
    const data = typeof fileData === 'string'
      ? new TextEncoder().encode(fileData)
      : new Uint8Array(fileData);
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    this.videoURL = URL.createObjectURL(blob);


    // eslint-disable-next-line no-console
    console.log('url::', this.videoURL);

    return blob;
  };

  /* async compressVideo(file: File, bitrate: string = '1000k', height: number = 720): Promise<File> {
    await this.loadFFmpeg();

    // Load the input file into the FFmpeg virtual file system
    FFmpeg.FS('writeFile', file.name, await fetchFile(file));

    // Perform compression
    const outputName = 'compressed_' + file.name;
    await this.ffmpeg.run(
      '-i', file.name,                // Input file
      '-vf', `scale=-1:${height}`,    // Scale height, maintain aspect ratio
      '-b:v', bitrate,                // Video bitrate
      '-b:a', '128k',                 // Audio bitrate
      outputName                      // Output file name
    );

    // Read the compressed file from the virtual file system
    const data = this.ffmpeg.FS('readFile', outputName);

    // Convert the compressed data to a Blob and create a new File object
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    return new File([blob], outputName, { type: 'video/mp4' });
  } */
}
