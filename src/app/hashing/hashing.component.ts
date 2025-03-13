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
  hashArray: number[] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];

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
    this.chunks = this.divideIntoChunks(this.messageInBinaryWithPadding);
    console.log(this.chunks);

    // hashing each chunk
    this.chunks.forEach((element) => {
      this.hashingEachChunk(element);
    });

    // combining Hash and sending Data
    this.hashArray.forEach((element) => {
      this.digest += element.toString(16);
    });
    this.sendHashValuesAndMessage();
  }

  hashingEachChunk(chunk: string) {
    // create a 64-entry message schedule array w[0..63] of 32-bit words
    let messageScheduleArray: Array<string> = [];
    let messageScheduleArraySize = 64;

    // copy chunk into first 16 words w[0..15] of the message schedule array
    let first16WordsOfChunkAs32Bit: Array<string> = this.divideIntoChunks(
      chunk,
      32
    );

    for (let index = 0; index < messageScheduleArraySize; index++) {
      if (index < 16) {
        messageScheduleArray[index] = first16WordsOfChunkAs32Bit[index];
      } else {
        messageScheduleArray[index] = '';
      }
    }

    // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array:
    // for i from 16 to 63
    //     s0 := (w[i-15] rightrotate 7) xor (w[i-15] rightrotate 18) xor (w[i-15] rightshift  3)
    //     s1 := (w[i-2] rightrotate 17) xor (w[i-2] rightrotate 19) xor (w[i-2] rightshift 10)
    //     w[i] := w[i-16] + s0 + w[i-7] + s1

    // Initialize working variables to current hash value:
    let a = this.hashArray[0];
    let b = this.hashArray[1];
    let c = this.hashArray[2];
    let d = this.hashArray[3];
    let e = this.hashArray[4];
    let f = this.hashArray[5];
    let g = this.hashArray[6];
    let h = this.hashArray[7];

    // Compression function main loop:
    // for i from 0 to 63
    //     S1 := (e rightrotate 6) xor (e rightrotate 11) xor (e rightrotate 25)
    //     ch := (e and f) xor ((not e) and g)
    //     temp1 := h + S1 + ch + k[i] + w[i]
    //     S0 := (a rightrotate 2) xor (a rightrotate 13) xor (a rightrotate 22)
    //     maj := (a and b) xor (a and c) xor (b and c)
    //     temp2 := S0 + maj

    //     h := g
    //     g := f
    //     f := e
    //     e := d + temp1
    //     d := c
    //     c := b
    //     b := a
    //     a := temp1 + temp2

    // Add the compressed chunk to the current hash value:
    // h0 := h0 + a
    // h1 := h1 + b
    // h2 := h2 + c
    // h3 := h3 + d
    // h4 := h4 + e
    // h5 := h5 + f
    // h6 := h6 + g
    // h7 := h7 + h
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

  divideIntoChunks(
    messageToChunk: string,
    chunkLength: number = 512
  ): Array<string> {
    let chunks: string[] = [];
    for (let index = 0; index < messageToChunk.length / chunkLength; index++) {
      chunks[index] = messageToChunk.substring(
        index * chunkLength,
        (index + 1) * chunkLength
      );
    }
    return chunks;
  }
}
