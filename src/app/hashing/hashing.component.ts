import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-hashing',
  template: `<p>hashing works!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HashingComponent implements OnInit {
  @Output() hashValues = new EventEmitter<string>();
  @Output() originalMessage = new EventEmitter<string>();

  // Initialize hash values: (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
  H0: number = 0x6a09e667;
  H1: number = 0xbb67ae85;
  H2: number = 0x3c6ef372;
  H3: number = 0xa54ff53a;
  H4: number = 0x510e527f;
  H5: number = 0x9b05688c;
  H6: number = 0x1f83d9ab;
  H7: number = 0x5be0cd19;

  // Initialize array of round constants: (first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311):
  roundConstantsArray: number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  hashArray: number[] = [
    this.H0,
    this.H1,
    this.H2,
    this.H3,
    this.H4,
    this.H5,
    this.H6,
    this.H7,
  ];
  messageOriginal: string = 'abc';
  messageInBinaryWithPadding: string = '';
  messageLength: number = 0;
  messageLengthIn64bit: string = '';

  digest: string = '';

  chunks: string[] = [];

  constructor() {}

  ngOnInit(): void {
    this.hashTheMessage();
  }

  hashTheMessage() {
    // preprocessing
    this.messageInBinaryWithPadding = this.preProcessMessage(
      this.messageOriginal
    );

    // chunking
    this.divideIntoChunks(this.messageInBinaryWithPadding);
    console.log(this.chunks);
    // compressing
    this.chunks.forEach((element) => {
      this.compress();
    });

    // combining Hash and sending Data
    this.hashArray.forEach((element) => {
      this.digest += element.toString(16);
    });
    this.sendHashValuesAndMessage();
  }

  compress() {
    throw new Error('Method not implemented.');
  }

  text2Binary(text: string, bitlength: number = 8) {
    return text
      .split('')
      .map((char) => char.charCodeAt(0).toString(2).padStart(bitlength, '0'))
      .join('');
  }

  sendHashValuesAndMessage() {
    this.hashValues.emit(this.digest);
    this.originalMessage.emit(this.messageOriginal);
  }

  appendMultipleBits(bitAmount: number, bitType: number) {
    for (let index = 0; index < bitAmount; index++) {
      this.appendSingleBit(bitType);
    }
  }

  appendSingleBit(bitType: number): string {
    if (bitType === 0 || bitType === 1) {
      return this.messageInBinaryWithPadding + bitType.toString();
    } else {
      return this.messageInBinaryWithPadding;
    }
  }

  appendLengthIn64bit(L: string): string {
    return this.messageInBinaryWithPadding + L;
  }

  logLengthInBits(input: any) {
    console.log(input.length);
  }

  preProcessMessage(message: string): string {
    this.messageInBinaryWithPadding = this.text2Binary(message);

    this.messageLength = this.messageInBinaryWithPadding.length;
    this.messageLengthIn64bit = this.messageLength
      .toString(2)
      .padStart(64, '0');

    this.messageInBinaryWithPadding = this.appendSingleBit(1);

    // add K 0-bits
    while ((this.messageInBinaryWithPadding.length + 64) % 512 != 0) {
      this.messageInBinaryWithPadding = this.appendSingleBit(0);
    }

    // add length of message in 64bit
    this.messageInBinaryWithPadding = this.appendLengthIn64bit(
      this.messageLengthIn64bit
    );
    console.log(
      'original message: ',
      this.messageOriginal,
      ' - padded message length: ',
      this.messageInBinaryWithPadding.length
    );
    return this.messageInBinaryWithPadding;
  }

  chunkMessage(message: string): string[] {
    return this.chunks;
  }

  divideIntoChunks(messageToChunk: string, chunkLength: number = 512) {
    for (let index = 0; index < messageToChunk.length / chunkLength; index++) {
      this.chunks[index] = messageToChunk.substring(
        index * chunkLength,
        (index + 1) * chunkLength
      );
    }
    return this.chunks;
  }
}
