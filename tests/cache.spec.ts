import Cache from "../src/cache";
import Entry from "../src/cache/entry";

describe('cache insert', function() {
  it('adds', function() {
    const cache = new Cache(5);

    expect(cache.count()).toBe(0);
    expect(cache.top()).toBe(null);
    expect(cache.bottom()).toBe(null);

    let first = cache.add("a.key", {});
    expect(cache.count()).toBe(1);
    expect(cache.top()).toBe(first);
    expect(cache.bottom()).toBe(first);

    let second = cache.add("another.key", {});
    expect(cache.count()).toBe(2);
    expect(cache.top()).toBe(second);
    expect(cache.bottom()).toBe(first);

    const third = cache.add("and.yet.anothe.key", {});
    expect(cache.count()).toBe(3);
    expect(cache.top()).toBe(third);
    expect(cache.bottom()).toBe(first);

    second = cache.add("another.key", {});
    expect(cache.count()).toBe(3);
    expect(cache.top()).toBe(second);
    expect(cache.bottom()).toBe(first);

    first = cache.add("a.key", {});
    expect(cache.count()).toBe(3);
    expect(cache.top()).toBe(first);
    expect(cache.bottom()).toBe(third);
  });

  it('removes', function() {
    const cache = new Cache(5);

    expect(cache.count()).toBe(0);
    expect(cache.top()).toBe(null);
    expect(cache.bottom()).toBe(null);

    let first = cache.add("a.key", {});
    expect(cache.count()).toBe(1);
    expect(cache.top()).toBe(first);
    expect(cache.bottom()).toBe(first);

    cache.rm("a.key");
    expect(cache.count()).toBe(0);
    expect(cache.top()).toBe(null);
    expect(cache.bottom()).toBe(null);

    first = cache.add("a.key", {});
    expect(cache.count()).toBe(1);
    expect(cache.top()).toBe(first);
    expect(cache.bottom()).toBe(first);

    let second = cache.add("another.key", {});
    expect(cache.count()).toBe(2);
    expect(cache.top()).toBe(second);
    expect(cache.bottom()).toBe(first);

    cache.rm("a.key");
    expect(cache.count()).toBe(1);
    expect(cache.top()).toBe(second);
    expect(cache.bottom()).toBe(second);

    cache.rm("another.key");
    expect(cache.count()).toBe(0);
    expect(cache.top()).toBe(null);
    expect(cache.bottom()).toBe(null);
  });

  it('fetches and promotes', function() {
    const cache = new Cache(5);

    expect(cache.count()).toBe(0);
    expect(cache.top()).toBe(null);
    expect(cache.bottom()).toBe(null);

    const first = cache.add("a.key", {});
    expect(cache.count()).toBe(1);
    expect(cache.top()).toBe(first);
    expect(cache.bottom()).toBe(first);

    const second = cache.add("another.key", {});
    expect(cache.count()).toBe(2);
    expect(cache.top()).toBe(second);
    expect(cache.bottom()).toBe(first);

    const data = cache.fetch("a.key")
    expect(cache.count()).toBe(2);
    expect(cache.top().key).toBe(first.key);
    expect(cache.bottom()).toBe(second);
    expect(data).toBe(first.value);
  });

  it('expires', async function() {
    const cache = new Cache(5);

    expect(cache.count()).toBe(0);
    expect(cache.top()).toBe(null);
    expect(cache.bottom()).toBe(null);

    let first = cache.add("a.key", {}, 1000);
    expect(cache.count()).toBe(1);
    let data = cache.fetch("a.key")
    expect(data).toBe(first.value);

    first = cache.add("a.key", {}, 5);
    await sleep(10);

    expect(cache.count()).toBe(1);
    data = cache.fetch("a.key")
    expect(data).toBe(undefined);
    expect(cache.count()).toBe(0);
  });

  it('evicts', function() {
    const cache = new Cache(3);

    expect(cache.count()).toBe(0);
    expect(cache.top()).toBe(null);
    expect(cache.bottom()).toBe(null);

    const a = cache.add("a", {});
    const b = cache.add("b", {});
    const c = cache.add("c", {});

    expect(cache.count()).toBe(3);
    expect(cache.top()).toBe(c);
    expect(cache.bottom()).toBe(a);

    const d = cache.add("e", {});
    const e = cache.add("d", {});
    const f = cache.add("f", {});

    expect(cache.count()).toBe(3);
    expect(cache.top()).toBe(f);
    expect(cache.bottom()).toBe(d);
  });
});

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
