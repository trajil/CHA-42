import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { Roundconstants } from './roundconstants';

@Component({
  selector: 'app-hashing',
  template: `<h1>CHA-42</h1>`,
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
  roundConstantsArrayImport = new Roundconstants();
  roundConstantsArray = this.roundConstantsArrayImport.roundConstantsArray;

  // All variables are 32 bit unsigned integers and addition is calculated modulo 2^32
  _32bitCeiling = 4294967296;

  messageOriginal: string = 'abc';
  messageInBinaryWithPadding: string = '';

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

    for (let index = 16; index < messageScheduleArraySize; index++) {
      // console.log(index)
    }

    // Initialize working variables to current hash value:
    // let a = this.text2Binary(this.hashArray[0].toString(),32);
    let a = this.hashArray[0];
    console.log('a after initialisation: ', a, 'type of a:', typeof a);
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

    this.hashArray[0] = (this.hashArray[0] + a) % this._32bitCeiling;
    console.log(
      'End of round of hashingChunk after adding a, value of H0 MODULO 2^32: ',
      this.hashArray[0]
    );

    this.hashArray[1] = (this.hashArray[1] + b) % this._32bitCeiling;
    this.hashArray[2] = (this.hashArray[2] + c) % this._32bitCeiling;
    this.hashArray[3] = (this.hashArray[3] + d) % this._32bitCeiling;
    this.hashArray[4] = (this.hashArray[4] + e) % this._32bitCeiling;
    this.hashArray[5] = (this.hashArray[5] + f) % this._32bitCeiling;
    this.hashArray[6] = (this.hashArray[6] + g) % this._32bitCeiling;
    this.hashArray[7] = (this.hashArray[7] + h) % this._32bitCeiling;
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

    let messageLength = this.messageInBinaryWithPadding.length;
    let messageLengthIn64bit = messageLength.toString(2).padStart(64, '0');

    this.messageInBinaryWithPadding = this.appendSingleBit(1);

    // add K 0-bits until the length -64 is dividible by 512
    while ((this.messageInBinaryWithPadding.length + 64) % 512 != 0) {
      this.messageInBinaryWithPadding = this.appendSingleBit(0);
    }

    // add length of message in 64bit
    this.messageInBinaryWithPadding =
      this.appendLengthIn64bit(messageLengthIn64bit);
    console.log(
      'original message: ',
      this.messageOriginal,
      ' - padded message length: ',
      this.messageInBinaryWithPadding.length
    );
    return this.messageInBinaryWithPadding;
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
