import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentSearchService implements OnApplicationBootstrap {
    private readonly indexEs = 'comment';

    constructor(
        private readonly searchService: ElasticsearchService,
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>
    ) {}

    // Initialize ES index and mapping when app starts
    async onApplicationBootstrap() {
        console.log('elasticsearch service is ready');
        
        // Delete index if it exists
        const exists = await this.searchService.indices.exists({ index: this.indexEs });
        if (exists) {
            await this.searchService.indices.delete({ index: this.indexEs });
            console.log('✅ Deleted existing index "comments"');
        }

        // Create new index with mapping
        await this.searchService.indices.create({ 
            index: this.indexEs,
            body: {
                mappings: {
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
                            type: 'nested',
                            properties: {
                                id: { type: 'integer' },
                                content: { type: 'text' }
                            }
                        },
                        author: {
                            type: 'nested',
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
                            type: 'nested',
                            properties: {
                                id: { type: 'integer' },
                                content: { type: 'text' }
                            }
                        }
                    }
                }
            }
        });
        console.log('✅ Index "comments" has been created with new mapping.');
    }

    async indexComment(document: any) {
        try {
            // console.log('Indexing comment:', JSON.stringify(document, null, 2));
            const result = await this.searchService.index({
                index: this.indexEs,
                id: document.id.toString(),
                document: document,
            });
            // console.log('Indexing result:', result);
            return result;
        } catch (error) {
            console.error('Error indexing comment:', error);
            throw error;
        }
    }

    async searchComments(q?: string, page = 1, limit = 10) {
        try {
            const from = (page - 1) * limit;
            const isNumber = q && /^\d+$/.test(q);

            // First, let's check if we have any documents
            const count = await this.countCommentsInES();
            console.log(`Total documents in index: ${count}`);

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
                            {
                                nested: {
                                    path: 'author',
                                    query: {
                                        match: {
                                            'author.fullname': {
                                                query: q,
                                                fuzziness: 'auto',
                                            },
                                        },
                                    },
                                },
                            },
                            {
                                nested: {
                                    path: 'post',
                                    query: {
                                        match: {
                                            'post.content': {
                                                query: q,
                                                fuzziness: 'auto',
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                        minimum_should_match: 1
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

            // console.log('Search query:', JSON.stringify(query, null, 2));

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

            console.log('Search result:', JSON.stringify(result, null, 2));

            const total =
                typeof result.hits.total === 'number'
                    ? result.hits.total
                    : result.hits.total?.value || 0;

            const data = result.hits.hits.map((hit) => hit._source);

            return { data, total, page, limit };
        } catch (error) {
            console.error('Error searching comments:', error);
            throw error;
        }
    }

    async searchCommentsByPost(postId: number, page = 1, limit = 10) {
        try {
            const from = (page - 1) * limit;

            // First, check if we have any documents
            const count = await this.countCommentsInES();
            console.log(`Total documents in index: ${count}`);

            // Create the query
            const query = {
                bool: {
                    must: [
                        {
                            nested: {
                                path: "post",
                                query: {
                                    bool: {
                                        must: [
                                            {
                                                term: {
                                                    "post.id": postId
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            };

            // console.log('Search query for post:', JSON.stringify(query, null, 2));

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

            // console.log('Search result:', JSON.stringify(result, null, 2));

            const total =
                typeof result.hits.total === 'number'
                    ? result.hits.total
                    : result.hits.total?.value || 0;

            const data = result.hits.hits.map((hit) => hit._source);

            return { data, total, page, limit };
        } catch (error) {
            console.error('Error searching comments by post:', error);
            throw error;
        }
    }

    async countCommentsInES(): Promise<number> {
        try {
            const res = await this.searchService.count({ index: this.indexEs });
            return res.count;
        } catch (error) {
            console.error('Error counting comments:', error);
            throw error;
        }
    }

    async deleteCommentFromIndex(commentId: number) {
        try {
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
        } catch (error) {
            console.error('Error deleting comment from index:', error);
            throw error;
        }
    }

    async deleteByFieldId(commentId: number) {
        try {
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
        } catch (error) {
            console.error('Error deleting by field ID:', error);
            throw error;
        }
    }

    async reindexAllComments() {
        try {
            console.log('Starting reindex of all comments...');
            
            // Delete existing index
            const exists = await this.searchService.indices.exists({ index: this.indexEs });
            if (exists) {
                await this.searchService.indices.delete({ index: this.indexEs });
                console.log('✅ Deleted existing index "comments"');
            }

            // Recreate index with mapping
            await this.searchService.indices.create({ 
                index: this.indexEs,
                body: {
                    mappings: {
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
                                type: 'nested',
                                properties: {
                                    id: { type: 'integer' },
                                    content: { type: 'text' }
                                }
                            },
                            author: {
                                type: 'nested',
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
                                type: 'nested',
                                properties: {
                                    id: { type: 'integer' },
                                    content: { type: 'text' }
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ Created new index with mapping');

            // Fetch all comments with relations
            const comments = await this.commentRepository.find({
                relations: ['author', 'post', 'parentComment'],
                order: {
                    createdAt: 'DESC'
                }
            });

            console.log(`Found ${comments.length} comments to index`);

            // Index each comment
            for (const comment of comments) {
                try {
                    await this.indexComment({
                        id: comment.id,
                        content: comment.content,
                        createdAt: comment.createdAt,
                        updatedAt: comment.updatedAt,
                        post: comment.post ? {
                            id: comment.post.id,
                            content: comment.post.content
                        } : null,
                        author: comment.author ? {
                            id: comment.author.id,
                            fullname: comment.author.fullname,
                            avatar: comment.author.profilepic
                        } : null,
                        parentComment: comment.parentComment ? {
                            id: comment.parentComment.id,
                            content: comment.parentComment.content
                        } : null
                    });
                } catch (error) {
                    console.error(`Error indexing comment ${comment.id}:`, error);
                }
            }

            // Verify indexing
            const count = await this.countCommentsInES();
            console.log(`✅ Reindexing complete. Total documents in index: ${count}`);

            return {
                success: true,
                message: `Successfully reindexed ${count} comments`,
                totalIndexed: count
            };
        } catch (error) {
            console.error('Error during reindexing:', error);
            throw error;
        }
    }
} 