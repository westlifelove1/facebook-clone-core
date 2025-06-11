import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class CommentSearchService implements OnApplicationBootstrap {
    private readonly indexEs = 'comment';

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
                        post: {
                            properties: {
                                id: { type: 'integer' },
                                content: { type: 'text' }
                            }
                        },
                        author: {
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
                        },
                        parentComment: {
                            properties: {
                                id: { type: 'integer' },
                                content: { type: 'text' }
                            }
                        }
                    }
                }
            });
            console.log('✅ Index "comments" has been initialized and mapped.');
        }
    }

    async indexComment(document: any) {
        return await this.searchService.index({
            index: this.indexEs,
            id: document.id.toString(),
            document: document,
        });
    }

    async searchComments(q?: string, page = 1, limit = 10) {
        const from = (page - 1) * limit;
        const isNumber = q && /^\d+$/.test(q);

        // If no query, match all
        const query: any = q
            ? {
                bool: {
                    should: [
                        {
                            match: {
                                content: {
                                    query: q,
                                    fuzziness: 'auto',
                                },
                            },
                        },
                        // {
                        //     nested: {
                        //         path: 'author',
                        //         query: {
                        //             match: {
                        //                 'author.fullname': {
                        //                     query: q,
                        //                     fuzziness: 'auto',
                        //                 },
                        //             },
                        //         },
                        //     },
                        // },
                    ],
                },
            }
            : {
                match_all: {},
            };

        // If query is a number, add ID match condition
        if (q && isNumber) {
            query.bool.should.push({
                term: {
                    id: parseInt(q),
                },
            });
        }

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

    async searchCommentsByPost(postId: number, page = 1, limit = 10) {
        const from = (page - 1) * limit;

        const result = await this.searchService.search({
            index: this.indexEs,
            query: {
                term: {
                    'post.id': postId
                }
            },
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

    async countCommentsInES(): Promise<number> {
        const res = await this.searchService.count({ index: this.indexEs });
        return res.count;
    }

    async deleteCommentFromIndex(commentId: number) {
        const result = await this.searchService.delete(
            {
                index: this.indexEs,
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