import repl from "repl";
import Cache from "./cache";
import Entry from "./cache/entry";

const replServer = repl.start({});

replServer.context.Cache = Cache;
replServer.context.Entry = Entry;
