import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class SearchService {
    private readonly userIndex = 'users';
    private readonly postIndex = 'posts';

    constructor(
        private readonly elasticsearchService: ElasticsearchService
    ) {
        console.log('search service constructor', this.elasticsearchService.name);
    }

    async indexDocument<T>(index: string, document: any) {
        return this.elasticsearchService.index<T>({
            index: index,
            body: document,
        });
    }

    async searchDocumentsSimpleField<T>(index: string, query: string) {
        return this.elasticsearchService.search<T>({
            index: index,
            query: {
                match: {
                    name: query,
                }
            }
        });
    }

    async searchDocumentsMultiField<T>(index: string, querySearch: string, fields: string[]) {
        return this.elasticsearchService.search<T>({
            index: index,
            query: {
                multi_match: {
                    query: querySearch,
                    fields: fields,
                    fuzziness: 'AUTO',
                    type: 'cross_fields',
                }
            }
        });
    }

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
}