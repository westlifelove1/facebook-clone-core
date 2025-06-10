import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class SearchService {
  private readonly userIndex = 'users';
  private readonly postIndex = 'posts';
  private readonly commentIndex = 'comment';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async searchUsers(query: string, page = 1, limit = 10) {
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
  }

  async searchPosts(query: string, page = 1, limit = 10) {
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
  }

  async indexUser(user: any) {
    return this.elasticsearchService.index({
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
  }

  async indexPost(post: any) {
    return this.elasticsearchService.index({
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
  }

  async indexComment(document: any) {
    return await this.elasticsearchService.index({
        index: this.commentIndex,
        id: document.id.toString(),
        document: document,
    });
}

  async removeUser(id: string) {
    return this.elasticsearchService.delete({
      index: this.userIndex,
      id,
    });
  }

  async removePost(id: string) {
    return this.elasticsearchService.delete({
      index: this.postIndex,
      id,
    });
  }

  async removeComment(commentId: number) {
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
        return { message: `Comment ${commentId} was not found in ES.` };
    }

    return { message: `Comment ${commentId} deleted from ES.` };
}
} 