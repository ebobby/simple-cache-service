export default class Entry {
  key: string;
  value: any;
  expires: number;

  previous: Entry;
  next: Entry;

  constructor(key: string, value: any, expires: number) {
    this.key = key;
    this.value = value;
    this.expires = expires || 0;
    this.previous = null;
    this.next = null;
  }
}
