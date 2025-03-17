import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
  Input,
  SimpleChanges,
} from '@angular/core';
import { Roundconstants } from './Roundconstants';
import { Rotator } from './Rotator';

@Component({
  selector: 'app-hashing',
  templateUrl: './hashing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HashingComponent implements OnInit {
  @Input() messageToHash: string = ''; // Receiving message from AppComponent
  @Input() keyToUse: number = 0; // Receiving message from AppComponent
  @Output() hashValues = new EventEmitter<string>();
  @Output() originalMessage = new EventEmitter<string>();

  // Initialize hash values: (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
  hashArray: Uint32Array = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ]);

  // Initialize array of round constants: (first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311):
  roundConstantsArrayImport = new Roundconstants();
  roundConstantsArrayU32Int = this.roundConstantsArrayImport.u32IntArray;

  // All variables are 32 bit unsigned integers and addition is calculated modulo 2^32
  _32bitCeiling = 4294967296;

  messageOriginal: string = this.messageToHash;
  messageInBinaryWithPadding: string = '';
  key = 0;

  digest: string = '';

  rotator = new Rotator();
  chunks: string[] = [];

  constructor() {}

  ngOnInit(): void {
    //this.hashTheMessage();

    let myNumber = 2;
    myNumber = this.calculateFirstNBitFractionOfRootM(myNumber, 32, 2);
    console.log(myNumber.toString(16));
  }

  calculateFirstNBitFractionOfRootM(
    input: number,
    bits: number = 32,
    root: number = 2
  ): number {
    input = Math.pow(input, 1 / root) % 1;
    let resultString = '';

    for (let index = 0; index < bits; index++) {
      input *= 2;
      let truncatedNumber = Math.trunc(input); //
      input = input % 1; 
      resultString += truncatedNumber;
    }

    console.log(resultString);
    let result = parseInt(resultString, 2);

    return result;
  }

  hashTheMessage() {
    this.digest = '';
    this.messageInBinaryWithPadding = this.preProcessMessage(
      this.messageOriginal
    );

    this.chunks = this.divideIntoChunks(this.messageInBinaryWithPadding);
    console.log(this.chunks);

    this.chunks.forEach((element) => {
      this.computeHash(element);
    });

    this.hashArray.forEach((element) => {
      this.digest += element.toString(16);
    });

    this.sendHashValuesAndMessage();
  }

  computeHash(chunk: string) {
    let messageScheduleArray: Uint32Array = new Uint32Array(64);
    let first16WordsOfChunkAs32Bit: Uint32Array = new Uint32Array(16);

    let first16WordsOfChunkAs32BitStrings: Array<string> =
      this.divideIntoChunks(chunk, 32);
    for (
      let index = 0;
      index < first16WordsOfChunkAs32BitStrings.length;
      index++
    ) {
      first16WordsOfChunkAs32Bit[index] = parseInt(
        first16WordsOfChunkAs32BitStrings[index],
        2
      );
    }
    for (let index = 0; index < messageScheduleArray.length; index++) {
      if (index < 16) {
        messageScheduleArray[index] = first16WordsOfChunkAs32Bit[index];
      } else {
        messageScheduleArray[index] = 0;
      }
    }
    console.log(messageScheduleArray[16]);

    // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array:
    // for i from 16 to 63
    //     s0 := (w[i-15] rightrotate 7) xor (w[i-15] rightrotate 18) xor (w[i-15] rightshift  3)
    //     s1 := (w[i-2] rightrotate 17) xor (w[i-2] rightrotate 19) xor (w[i-2] rightshift 10)
    //     w[i] := w[i-16] + s0 + w[i-7] + s1

    let sigmaArray: Uint32Array = new Uint32Array(2);

    for (let index = 16; index < messageScheduleArray.length; index++) {
      sigmaArray[0] =
        this.rotator.bitRotateRightNumber(messageScheduleArray[index - 15], 7) ^
        this.rotator.bitRotateRightNumber(
          messageScheduleArray[index - 15],
          18
        ) ^
        (messageScheduleArray[index - 15] >>> 3);
      sigmaArray[1] =
        this.rotator.bitRotateRightNumber(messageScheduleArray[index - 2], 17) ^
        this.rotator.bitRotateRightNumber(messageScheduleArray[index - 2], 19) ^
        (messageScheduleArray[index - 2] >>> 10);
      messageScheduleArray[index] =
        messageScheduleArray[index - 16] +
        sigmaArray[0] +
        messageScheduleArray[index - 7] +
        sigmaArray[1];
    }

    let workingVariables: Uint32Array = new Uint32Array(8);

    workingVariables = this.hashArray.slice();

    let compressionArray: Uint32Array = new Uint32Array(6);
    for (let index = 0; index < 64 + this.key; index++) {
      //     S1 := (e rightrotate 6) xor (e rightrotate 11) xor (e rightrotate 25)
      //     ch := (e and f) xor ((not e) and g)
      //     temp1 := h + S1 + ch + k[i] + w[i]
      //     S0 := (a rightrotate 2) xor (a rightrotate 13) xor (a rightrotate 22)
      //     maj := (a and b) xor (a and c) xor (b and c)
      //     temp2 := S0 + maj
      compressionArray[CompressionVariables.S1] =
        this.rotator.bitRotateRightNumber(
          workingVariables[WorkingVariables.e],
          6
        ) ^
        this.rotator.bitRotateRightNumber(
          workingVariables[WorkingVariables.e],
          11
        ) ^
        this.rotator.bitRotateRightNumber(
          workingVariables[WorkingVariables.e],
          25
        );
      compressionArray[CompressionVariables.ch] =
        (workingVariables[WorkingVariables.e] &
          workingVariables[WorkingVariables.f]) ^
        (~workingVariables[WorkingVariables.e] &
          workingVariables[WorkingVariables.g]);
      compressionArray[CompressionVariables.temp1] =
        workingVariables[WorkingVariables.h] +
        compressionArray[CompressionVariables.S1] +
        compressionArray[CompressionVariables.ch] +
        this.roundConstantsArrayU32Int[index % 64] +
        messageScheduleArray[index % 64];
      compressionArray[CompressionVariables.S0] =
        this.rotator.bitRotateRightNumber(
          workingVariables[WorkingVariables.a],
          2
        ) ^
        this.rotator.bitRotateRightNumber(
          workingVariables[WorkingVariables.a],
          13
        ) ^
        this.rotator.bitRotateRightNumber(
          workingVariables[WorkingVariables.a],
          22
        );
      compressionArray[CompressionVariables.maj] =
        (workingVariables[WorkingVariables.a] &
          workingVariables[WorkingVariables.b]) ^
        (workingVariables[WorkingVariables.a] &
          workingVariables[WorkingVariables.c]) ^
        (workingVariables[WorkingVariables.b] &
          workingVariables[WorkingVariables.c]);
      compressionArray[CompressionVariables.temp2] =
        compressionArray[CompressionVariables.S0] +
        compressionArray[CompressionVariables.maj];

      workingVariables[WorkingVariables.h] =
        workingVariables[WorkingVariables.g];
      workingVariables[WorkingVariables.g] =
        workingVariables[WorkingVariables.f];
      workingVariables[WorkingVariables.f] =
        workingVariables[WorkingVariables.e];
      workingVariables[WorkingVariables.e] =
        workingVariables[WorkingVariables.d] +
        compressionArray[CompressionVariables.temp1];
      workingVariables[WorkingVariables.d] =
        workingVariables[WorkingVariables.c];
      workingVariables[WorkingVariables.c] =
        workingVariables[WorkingVariables.b];
      workingVariables[WorkingVariables.b] =
        workingVariables[WorkingVariables.a];
      workingVariables[WorkingVariables.a] =
        compressionArray[CompressionVariables.temp1] +
        compressionArray[CompressionVariables.temp2];
    }

    for (let index = 0; index < workingVariables.length; index++) {
      this.hashArray[index] = this.hashArray[index] + workingVariables[index];
    }
  }

  text2Binary(text: string, bitlength: number = 8) {
    return text
      .split('')
      .map((char) => char.charCodeAt(0).toString(2).padStart(bitlength, '0'))
      .join('');
  }

  numberTo32BitString(n: number): string {
    const binaryString = n.toString(2).padStart(32, '0');
    return binaryString;
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

  preProcessMessage(message: string): string {
    this.messageInBinaryWithPadding = this.text2Binary(message);

    let messageLength = this.messageInBinaryWithPadding.length;
    let messageLengthIn64bit = messageLength.toString(2).padStart(64, '0');

    this.messageInBinaryWithPadding = this.appendSingleBit(1);

    while ((this.messageInBinaryWithPadding.length + 64) % 512 != 0) {
      this.messageInBinaryWithPadding = this.appendSingleBit(0);
    }

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

export enum WorkingVariables {
  a = 0,
  b,
  c,
  d,
  e,
  f,
  g,
  h,
}
export enum CompressionVariables {
  S1 = 0,
  ch,
  temp1,
  S0,
  maj,
  temp2,
}
