export class Rotator {
  shiftRightString(input: string, bits: number = 1): string {
    let temp = parseInt(input, 2) >> bits;

    return temp.toString(2);
  }
  shiftLeftString(input: string, bits: number = 1): string {
    let temp = parseInt(input, 2) << bits;

    return temp.toString(2);
  }
  rotateRightString(input: string, bits: number = 1): string {
    return input;
  }
  rotateLeftString(input: string, bits: number = 1): string {
    let temp = parseInt(input, 2) << bits;

    return temp.toString(2);
  }
  rotateRightNumber(input: number, bits: number = 1): number {
    return input;
  }
  rotateLeftNumber(input: number, bits: number = 1): number {
    return input << bits;
  }
}

/*
20 << 1


*/
