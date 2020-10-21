export default class Entry {
  key: string;
  value: any;

  previous: Entry;
  next: Entry;

  constructor(key: string, value: any) {
    this.key = key;
    this.value = value;
    this.previous = null;
    this.next = null;
  }
}
