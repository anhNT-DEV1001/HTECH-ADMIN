export interface IWeb {
  id: number;
  name: string;
  alias: string;
  url: string;
}

export interface ICreateWeb {
  name: string;
  alias: string;
  url: string;
}

export interface IUpdateWeb extends Partial<ICreateWeb> {
  id: number;
}
