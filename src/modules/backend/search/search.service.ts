import { Injectable, Inject } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SearchService {
  private readonly userIndex = 'users';
  private readonly postIndex = 'posts';
  private readonly commentIndex = 'comment';

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    @Inject('APP_SERVICE') private readonly client: ClientProxy,
  ) {}

  async searchUsers(query: string, page = 1, limit = 10) {
    try {
      const response = await this.elasticsearchService.search<SearchResponse>({
        index: this.userIndex,
        body: {
          query: {
            multi_match: {
              query,
              fields: ['username', 'fullName', 'bio'],
              fuzziness: 'AUTO',
            },
          },
          from: (page - 1) * limit,
          size: limit,
        },
      });

      return response.hits.hits.map((hit) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
      }));
    } catch (error) {
      await firstValueFrom(this.client.emit('search.error', { 
        operation: 'searchUsers',
        error: error.message,
        query,
        page,
        limit
      }));
      throw error;
    }
  }

  async searchPosts(query: string, page = 1, limit = 10) {
    try {
      const response = await this.elasticsearchService.search<SearchResponse>({
        index: this.postIndex,
        body: {
          query: {
            multi_match: {
              query,
              fields: ['content', 'title'],
              fuzziness: 'AUTO',
            },
          },
          from: (page - 1) * limit,
          size: limit,
        },
      });

      return response.hits.hits.map((hit) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source,
      }));
    } catch (error) {
      await firstValueFrom(this.client.emit('search.error', {
        operation: 'searchPosts',
        error: error.message,
        query,
        page,
        limit
      }));
      throw error;
    }
  }

  async indexUser(user: any) {
    try {
      const result = await this.elasticsearchService.index({
        index: this.userIndex,
        id: user.id,
        body: {
          username: user.username,
          fullName: user.fullName,
          bio: user.bio,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
      await firstValueFrom(this.client.emit('search.indexed', {
        operation: 'indexUser',
        id: user.id,
        success: true
      }));
      return result;
    } catch (error) {
      await firstValueFrom(this.client.emit('search.error', {
        operation: 'indexUser',
        error: error.message,
        user
      }));
      throw error;
    }
  }

  async indexPost(post: any) {
    try {
      const result = await this.elasticsearchService.index({
        index: this.postIndex,
        id: post.id,
        body: {
          title: post.title,
          content: post.content,
          authorId: post.authorId,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        },
      });
      await firstValueFrom(this.client.emit('search.indexed', {
        operation: 'indexPost',
        id: post.id,
        success: true
      }));
      return result;
    } catch (error) {
      await firstValueFrom(this.client.emit('search.error', {
        operation: 'indexPost',
        error: error.message,
        post
      }));
      throw error;
    }
  }

  async indexComment(document: any) {
    try {
      const result = await this.elasticsearchService.index({
        index: this.commentIndex,
        id: document.id.toString(),
        document: document,
      });
      await firstValueFrom(this.client.emit('search.indexed', {
        operation: 'indexComment',
        id: document.id,
        success: true
      }));
      return result;
    } catch (error) {
      await firstValueFrom(this.client.emit('search.error', {
        operation: 'indexComment',
        error: error.message,
        document
      }));
      throw error;
    }
  }

  async removeUser(id: string) {
    try {
      const result = await this.elasticsearchService.delete({
        index: this.userIndex,
        id,
      });
      await firstValueFrom(this.client.emit('search.removed', {
        operation: 'removeUser',
        id,
        success: true
      }));
      return result;
    } catch (error) {
      await firstValueFrom(this.client.emit('search.error', {
        operation: 'removeUser',
        error: error.message,
        id
      }));
      throw error;
    }
  }

  async removePost(id: string) {
    try {
      const result = await this.elasticsearchService.delete({
        index: this.postIndex,
        id,
      });
      await firstValueFrom(this.client.emit('search.removed', {
        operation: 'removePost',
        id,
        success: true
      }));
      return result;
    } catch (error) {
      await firstValueFrom(this.client.emit('search.error', {
        operation: 'removePost',
        error: error.message,
        id
      }));
      throw error;
    }
  }

  async removeComment(commentId: number) {
    try {
      const result = await this.elasticsearchService.delete(
        {
          index: this.commentIndex,
          id: commentId.toString(),
        },
        {
          ignore: [404],
        }
      );

      if (result.result === 'not_found') {
        await firstValueFrom(this.client.emit('search.warning', {
          operation: 'removeComment',
          id: commentId,
          message: `Comment ${commentId} was not found in ES.`
        }));
        return { message: `Comment ${commentId} was not found in ES.` };
      }

      await firstValueFrom(this.client.emit('search.removed', {
        operation: 'removeComment',
        id: commentId,
        success: true
      }));
      return { message: `Comment ${commentId} deleted from ES.` };
    } catch (error) {
      await firstValueFrom(this.client.emit('search.error', {
        operation: 'removeComment',
        error: error.message,
        commentId
      }));
      throw error;
    }
  }
} 