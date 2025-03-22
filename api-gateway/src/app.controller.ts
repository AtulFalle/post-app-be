import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Throttle } from '@nestjs/throttler';

@Controller('posts')
export class AppController {
  client: any;
  constructor(@Inject('POST_SERVICE') private readonly postService: ClientProxy) { }


  @Throttle({ "limit": {limit: 5,ttl: 60 } })
  @Post()
  createPost(@Body() postData: { title: string; description: string }) {
    return this.postService.send('createPost', postData);
  }

  @Throttle({ "limit": {limit: 5,ttl: 60 } })
  @Get()
  getAllPosts() {
    return this.postService.send('getAllPosts', {});
  }

  @Get(':id')
  getPostById(@Param('id') id: string) {
    return this.postService.send('getPostById', id);
  }
}
