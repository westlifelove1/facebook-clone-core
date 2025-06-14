import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class PostSearchService implements OnApplicationBootstrap {
    private readonly indexEs = 'post';

    constructor(
        private readonly searchService: ElasticsearchService
    ) {}

    // Initialize ES index and mapping when app starts
    async onApplicationBootstrap() {
        console.log('elasticsearch service is ready');
        const exists = await this.searchService.indices.exists({ index: this.indexEs });
        if (!exists) {
            await this.searchService.indices.create({ index: this.indexEs });
            await this.searchService.indices.putMapping({
                index: this.indexEs,
                body: {
                    properties: {
                        id: { type: 'integer' },
                        content: { 
                            type: 'text',
                            fields: {
                                keyword: { type: 'keyword', ignore_above: 256 }
                            }
                        },
                        createdAt: { type: 'date', format: 'strict_date_optional_time||epoch_millis' },
                        updatedAt: { type: 'date', format: 'strict_date_optional_time||epoch_millis' },
                        user: {
                            properties: {
                                id: { type: 'integer' },
                                fullname: {
                                    type: 'text',
                                    fields: {
                                        keyword: { type: 'keyword', ignore_above: 256 }
                                    }
                                },
                                avatar: { type: 'keyword' }
                            }
                        }
                       
                    }
                }
            });
            console.log('✅ Index "posts" has been initialized and mapped.');
        }
    }

    async indexPost(document: any) {
        return await this.searchService.index({
            index: this.indexEs,
            id: document.id.toString(),
            document: document,
        });
    }

    async searchPosts(userId: number, q?: string, page = 1, limit = 10) {
        const from = (page - 1) * limit;
        const isNumber = q && /^\d+$/.test(q);  
        console.log("userId:", userId); 

        const query: any = {
            bool: {
                must: [
                    {
                        term: {
                            isType: 0
                        }
                    }
                ]
            }
        };

        // Add search term if provided
        if (q) {
            query.bool.should = [
                {
                    match: {
                        content: {
                            query: q,
                            fuzziness: 'auto'
                        }
                    }
                },
                {
                    nested: {
                        path: 'user',
                        query: {
                            match: {
                                'user.fullname': {
                                    query: q,
                                    fuzziness: 'auto'
                                }
                            }
                        }
                    }
                }
            ];
            
            // If query is a number, add ID match
            if (isNumber) {
                query.bool.should.push({
                    term: {
                        id: parseInt(q)
                    }
                });
            }
        }

        // console.log('Search query:', JSON.stringify(query));

        const result = await this.searchService.search({
            index: this.indexEs,
            query,
            from,
            size: limit,
            sort: [
                {
                    createdAt: {
                        order: 'desc',
                    },
                },
            ],
        });

        const total =
            typeof result.hits.total === 'number'
                ? result.hits.total
                : result.hits.total?.value || 0;

        const data = result.hits.hits.map((hit) => hit._source);

        return { data, total, page, limit };
    }

    async countPostsInES(): Promise<number> {
        const res = await this.searchService.count({ index: this.indexEs });
        return res.count;
    }

    async deletePostFromIndex(postId: number) {
        const result = await this.searchService.delete(
            {
                index: this.indexEs,
                id: postId.toString(),
            },
            {
                ignore: [404],
            }
        );

        if (result.result === 'not_found') {
            return { message: `Post ${postId} was not found in ES.` };
        }

        return { message: `Post ${postId} deleted from ES.` };
    }

    async deleteByFieldId(commentId: number) {
        const result = await this.searchService.deleteByQuery({
            index: this.indexEs,
            query: {
                match: {
                    id: commentId,
                },
            },
        });

        return {
            deleted: result.deleted,
            message: `Deleted all documents with id = ${commentId}`,
        };
    }
} 