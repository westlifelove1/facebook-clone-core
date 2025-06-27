import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { QueryFailedError } from 'typeorm';
import { PostService } from './post.service';

@Injectable()
export class PostSearchService implements OnApplicationBootstrap {
    private readonly indexEs = 'post';

    constructor(
        private readonly searchService: ElasticsearchService,
        private readonly postService: PostService, 
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
                            type: "nested",
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

            await this.indexData(); 
        }
    }

    private async indexData() {
        const posts = await this.postService.findAll(); 
        if (!posts.length) {
            console.log('No posts found to index.');
            return;
        }
        const bulkBody = posts.flatMap(post => [
            { index: { _index: this.indexEs, _id: post.id } },
            {
                id: post.id,
                isType: post.isType,
                content: post.content,  
                mediaUrl: post.mediaUrl || [],
                friends: post.friends || null,
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString(),
                user: {
                    id: post.user.id,   
                    fullname: post.user.fullname,
                    email: post.user.email,
                    profilepic: post.user.profilepic,
                    coverpic: post.user.coverpic,
                    displayname: post.user.displayname,
                    bio: post.user.bio,
                    birthplace: post.user.birthplace,
                    workingPlace: post.user.workingPlace,
                    isActive: post.user.isActive,
                    createdAt: post.user.createdAt.toISOString(),
                    updatedAt: post.user.updatedAt.toISOString(),
                }  
            }
        ]);
        const result = await this.searchService.bulk({ body: bulkBody });
        if (result.errors) {
            console.error('❌ Some documents failed to index:', result.items);
        } else {
            console.log(`✅ Successfully indexed ${posts.length} old posts.`);
        }
    }

    async indexPost(document: any) {
        return await this.searchService.index({
            index: this.indexEs,
            id: document.id.toString(),
            document: document,
        });
    }

    async searchFeed(userId: number, q?: string, type?:string, page = 1, limit = 10) {
        const from = (page - 1) * limit;
        const isNumber = q && /^\d+$/.test(q);  
        console.log("userId:", userId); 

        if (type == 'top'){
            var query: any = {
                bool: {
                    must: [
                        {
                            term: {
                                isType: 0
                            }
                        },
                      
                    ]
                }
            };
        }else if (type == 'photo') {

        }else if (type == 'video') {
           
        }else {  
        
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
    
    async searchUserPosts(userId: number, q?: string, page = 1, limit = 10) {
        const from = (page - 1) * limit;
        const isNumber = q && /^\d+$/.test(q);  
        console.log("userId:", userId); 

       const query: any = {
                    bool: {
                        must: [
                        {
                            "nested": {
                            "path": "user",
                            "query": {
                                "term": { "user.id": userId }
                            }
                            }
                        },
                        ]
                    }
        };
        // Add search term if provided
        if (q) {
            query.bool.must = [
                {
                    match: {
                        content: {
                            query: q,
                            fuzziness: 'auto'
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

        console.log('Search query:', JSON.stringify(query));
        console.log('from:', from, 'limit:', limit);
        const result = await this.searchService.search({
            index: this.indexEs,
            query,
            from,
            size: limit,
            sort: [
                {
                    updatedAt: {
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
    async searchPosts(userId: number, q?: string, page = 1, limit = 10) {
        const from = (page - 1) * limit;
        const isNumber = q && /^\d+$/.test(q);  
        console.log("userId:", userId); 

       const query: any = {
                    bool: {
                        should: [
                        {
                            term: {
                                isType: 0
                            }
                        },
                        {
                            "nested": {
                            "path": "user",
                            "query": {
                                "term": { "user.id": userId }
                            }
                            }
                        },
                        ]
                    }
        };
        // Add search term if provided
        if (q) {
            query.bool.must = [
                {
                    match: {
                        content: {
                            query: q,
                            fuzziness: 'auto'
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

        console.log('Search query:', JSON.stringify(query));
        console.log('from:', from, 'limit:', limit);
        const result = await this.searchService.search({
            index: this.indexEs,
            query,
            from,
            size: limit,
            sort: [
                {
                    updatedAt: {
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

    async deleteByFieldId(postId: number) {
        const result = await this.searchService.deleteByQuery({
            index: this.indexEs,
            query: {
                match: {
                    id: postId,
                },
            },
        });

        return {
            deleted: result.deleted,
            message: `Deleted all documents with id = ${postId}`,
        };
    }
} 