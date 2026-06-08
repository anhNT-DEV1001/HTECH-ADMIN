import type { IWeb } from "@/features/web/interfaces";

export interface IQA {
  id: number;
  category_id: number;
  question_vn: string;
  question_en?: string | null;
  ans_vn?: string | null;
  ans_en?: string | null;
  category?: IQACategory;
}

export interface IQACategory {
  id: number;
  name_vn: string;
  name_en?: string | null;
  web_id: number;
  web?: IWeb;
  qas?: IQA[];
}

export interface ICreateQACategory {
  name_vn: string;
  name_en?: string;
  web_id: number;
}

export interface IUpdateQACategory extends Partial<ICreateQACategory> {
  id: number;
}

export interface ICreateQA {
  category_id: number;
  question_vn: string;
  question_en?: string;
  ans_vn?: string;
  ans_en?: string;
}

export interface IUpdateQA extends Partial<ICreateQA> {
  id: number;
}
