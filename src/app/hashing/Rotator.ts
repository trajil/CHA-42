export class Rotator {
  bitShiftRightString(input: string, bits: number = 1): string {
    let temp = parseInt(input, 2) >> bits;

    return temp.toString(2);
  }
  bitShiftLeftString(input: string, bits: number = 1): string {
    let temp = parseInt(input, 2) << bits;

    return temp.toString(2);
  }
  bitRotateRightString(input: string, bits: number = 1): string {
    let temp = parseInt(input, 2) >> bits;

    return temp.toString(2);
  }
  bitRotateLeftString(input: string, bits: number = 1): string {
    let temp = parseInt(input, 2) << bits;

    return temp.toString(2);
  }
  bitRotateRightNumber(input: number, bits: number = 1): number {
    console.log(this.numberTo32BitString(input >>> bits));
    console.log(this.numberTo32BitString(input << (32 - bits)));
    let temp = (input >>> bits) | (input << (32 - bits));
    // ((t1h >>> 1) | (t1l << 31))
    return temp;
  }
  bitRotateLeftNumber(input: number, bits: number = 1): number {
    console.log(this.numberTo32BitString(input << bits));
    console.log(this.numberTo32BitString(input >>> (32 - bits)));
    let temp = (input << bits) | (input >>>(32 - bits));
    // ((t1h >>> 1) | (t1l << 31))
    return temp;
  }

  numberTo32BitString(n: number): string {
    // Convert to binary and pad with leading zeros to ensure 32 bits
    const binaryString = n.toString(2).padStart(32, '0');
    return binaryString;
  }
}

/*
20 << 1


*/
