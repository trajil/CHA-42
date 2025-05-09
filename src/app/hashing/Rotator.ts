export class Rotator {
  bitShiftRightString(input: string, bits: number = 1): string {
    let temp = parseInt(input, 2) >> bits;

    return temp.toString(2);
  }
  bitShiftLeftString(input: string, bits: number = 1): string {
    let temp = parseInt(input, 2) << bits;

    return temp.toString(2);
  }
  bitRotateRightNumber(input: number, bits: number = 1): number {
    let temp = (input >>> bits) | (input << (32 - bits));
    return temp;
  }
  bitRotateLeftNumber(input: number, bits: number = 1): number {
    let temp = (input << bits) | (input >>> (32 - bits));
    return temp;
  }
}
