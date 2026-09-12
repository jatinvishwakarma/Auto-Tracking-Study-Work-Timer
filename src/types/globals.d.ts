declare module "papaparse" {
  interface ParseResult<T = unknown> {
    data: T[];
    errors: ParseError[];
    meta: ParseMeta;
  }

  interface ParseError extends Error {
    code: string;
  }

  interface ParseMeta {
    fields?: string[];
    [key: string]: unknown;
  }

  interface ParseConfig<T = unknown> {
    header?: boolean;
    skipEmptyLines?: boolean;
    complete?: (result: ParseResult<T>) => void;
    error?: (error: ParseError) => void;
  }

  function parse<T = unknown>(file: File, config: ParseConfig<T>): ParseResult<T>;
  function parse<T = unknown>(data: string, config: ParseConfig<T>): ParseResult<T>;

  // eslint-disable-next-line import/no-anonymous-default-export
  export default { parse };
}
