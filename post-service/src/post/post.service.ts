import { Injectable, NotFoundException, Inject, OnModuleInit } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.schema';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import Consul from 'consul';

/**
 * Service responsible for managing blog posts with Redis caching.
 */
@Injectable()
export class PostService {
  consul: any;
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache, 
    
  ) {}

 
  /**
   * Creates a new post and clears the cache.
   * @param {string} title - The title of the post.
   * @param {string} description - The description of the post.
   * @returns {Promise<Post>} - The created post document.
   */
  async create(title: string, description: string, id: string): Promise<Post> {
    const newPost = new this.postModel({ title, description, createdBy: id });
    const savedPost = await newPost.save();

    // Clear cache when a new post is created
    await this.cacheManager.del('posts');

    return savedPost;
  }

  /**
   * Retrieves all posts from Redis (if available) or MongoDB.
   * @returns {Promise<Post[]>} - An array of post documents.
   */
  async findAll(): Promise<Post[]> {
    const cachedPosts = await this.cacheManager.get<Post[]>('posts');

    if (cachedPosts) {
      console.log('Fetching posts from cache...');
      return cachedPosts;
    }

    console.log('Fetching posts from MongoDB...');
    const posts = await this.postModel.find().exec();

    // Store in cache for future requests (TTL: 60 sec)
    await this.cacheManager.set('posts', posts, 3660);

    return posts;
  }

  /**
   * Retrieves a post by its ID from Redis (if available) or MongoDB.
   * @param {string} id - The ID of the post.
   * @returns {Promise<Post>} - The found post document.
   * @throws {NotFoundException} - If the post is not found.
   */
  async findById(id: string): Promise<Post> {
    const cachedPost = await this.cacheManager.get<Post>(`post_${id}`);

    if (cachedPost) {
      console.log(`Fetching post ${id} from cache...`);
      return cachedPost;
    }

    const post = await this.postModel.findById(id).exec();
    if (!post) throw new NotFoundException(`Post with ID ${id} not found`);

    // Store in cache for 60 seconds
    await this.cacheManager.set(`post_${id}`, post, 60);

    return post;
  }

  /**
   * Updates a post and clears related cache.
   * @param {string} id - The ID of the post to update.
   * @param {string} title - The updated title.
   * @param {string} description - The updated description.
   * @returns {Promise<Post>} - The updated post document.
   * @throws {NotFoundException} - If the post is not found.
   */
  async update(id: string, title: string, description: string): Promise<Post> {
    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, { title, description }, { new: true, runValidators: true })
      .exec();

    if (!updatedPost) throw new NotFoundException(`Post with ID ${id} not found`);

    // Clear cache for this post and all posts list
    await this.cacheManager.del(`post_${id}`);
    await this.cacheManager.del('posts');

    return updatedPost;
  }

  /**
   * Deletes a post and clears related cache.
   * @param {string} id - The ID of the post to delete.
   * @returns {Promise<{ message: string }>} - A success message if deleted.
   * @throws {NotFoundException} - If the post is not found.
   */
  async delete(id: string): Promise<{ message: string }> {
    const deletedPost = await this.postModel.findByIdAndDelete(id).exec();

    if (!deletedPost) throw new NotFoundException(`Post with ID ${id} not found`);

    // Clear cache for this post and all posts list
    await this.cacheManager.del(`post_${id}`);
    await this.cacheManager.del('posts');

    return { message: 'Post deleted successfully' };
  }
}
