export class Util {
  static objectOfArrayWithProperty(array: Array<any>, key: any, value: any): any {
    for (let object of array) {
      if (object[key] == value) return object;
    }

    return null;
  }

  static allObjectsOfArrayWithProperty(array: Array<any>, key: any, value: any): Array<any> {
    let result: Array<any> = [];

    for (let object of array) {
      if (object[key] == value) result.push(object);
    }

    return result;
  }

  // Sanetizes a string and prepends a date id specified
  static sanetizeString(string: string, prependDate?: boolean): string {
    const regex = new RegExp(/[\ \\\/\|\*\"\:\?\<\>]/g);
    const date = `${new Date().toISOString().split("T")[0]}-`;

    return `${prependDate ? date : ""}${string.replace(regex, "_")}`;
  }

  static randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }
}