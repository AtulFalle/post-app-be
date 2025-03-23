import { Controller, Get, Post, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TcpClientService } from './tcp-client.service';
import { AuthGuard } from './guard/auth.guard';

@Controller('posts')
export class AppController {
  client: any;
  constructor(@Inject('POST_SERVICE') private readonly postService: ClientProxy,
  private readonly tcpClientService: TcpClientService
) {

  }


  /**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     description: Adds a new post to the database
 */
  @Post()
  @ApiOperation({ summary: 'Create a new post', description: 'Adds a new post to the database' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'My First Post' },
        description: { type: 'string', example: 'This is a test description' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  createPost(@Body() body: { title: string; description: string }) {
    console.log('Sending request to Post Service for body:', JSON.stringify(body));
    return this.tcpClientService.send({ cmd: 'create_post' }, body);
  }

  @Throttle({ "limit": { limit: 5, ttl: 60 } })
  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getAllPosts() {
    return this.tcpClientService.send({ cmd: 'get_all_post' }, {});
  }

  @Get(':id')
  @Throttle({ default: { limit: 2, ttl: 50 } })
  getPostById(@Param('id') id: string) {
    console.log('Sending request to GET POST Service for ID:', id);
    return this.tcpClientService.send({ cmd: 'get_post_by_id' }, { id });
  }
}
