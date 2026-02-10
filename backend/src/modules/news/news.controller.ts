import { Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { NewsService } from "./news.service";
import { AuthUser } from "src/common/decorators";
import { CreateNewsDto } from "./dto";
import { BaseResponse } from "src/common/apis";

@Controller('news')
export class NewsController{
  constructor(private readonly newsService: NewsService){}
  
}