import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { QueryFailedError } from 'typeorm';
import { NotifyService } from './notify.service';

@Injectable()
export class NotifySearchService implements OnApplicationBootstrap {
    private readonly indexEs = 'notify';

    constructor(
        private readonly searchService: ElasticsearchService,
        private readonly notifyService: NotifyService,
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
            console.log('✅ Index "notify" has been initialized and mapped.');

            await this.indexData(); 
        }
    }

    private async indexData() {
        const notifications = await this.notifyService.findAll(); 
        if (!notifications.length) {
            console.log('No notify found to index.');
            return;
        }
        const bulkBody = notifications.flatMap(notify => [
            { index: { _index: this.indexEs, _id: notify.id } },
            {
                    id: notify.id,
                    content: notify.content,
                    createdAt: notify.createdAt,
                    user: notify.user ?     {
                        id: notify.user.id,
                        fullname: notify.user.fullname,
                        email: notify.user.email,
                        phone: notify.user.phone,
                        profilepic: notify.user.profilepic, // Assuming profilepic is the avatar URL
                        coverpic: notify.user.coverpic,
                        displayname: notify.user.displayname,
                        bio: notify.user.bio,
                        avatar: notify.user.profilepic, // Assuming profilepic is the avatar URL
                    }: null,
                    post: notify.post ? {
                        id: notify.post.id,
                        content: notify.post.content,
                        isType: notify.post.isType,
                        mediaUrl: notify.post.mediaUrl,
                        friends: notify.post.friends,
                        createdAt: notify.post.createdAt,
                        updatedAt: notify.post.updatedAt,
                    } : null


            }
        ]);
        const result = await this.searchService.bulk({ body: bulkBody });
        if (result.errors) {
            console.error('❌ Some documents failed to index:', result.items);
        } else {
            console.log(`✅ Successfully indexed ${notifications.length} old notifications.`);
        }
    }

    async indexNotify(document: any) {
        return await this.searchService.index({
            index: this.indexEs,
            id: document.id.toString(),
            document: document,
        });
    }

    async searchNotify(userId: number, q?: string, page = 1, limit = 10) {
        const from = (page - 1) * limit;
        const isNumber = q && /^\d+$/.test(q);  
        console.log("userId:", userId); 

        const query: any = {
                    "term": {
                        "user.id": {
                            "value": userId
                        }
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
                        path: 'post',
                        query: {
                            match: {
                                'post.content': {
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

        console.log('Search query:', JSON.stringify(query));

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

    async countNotifyInES(): Promise<number> {
        const res = await this.searchService.count({ index: this.indexEs });
        return res.count;
    }

    async deleteNotifyFromIndex(notifyId: number) {
        const result = await this.searchService.delete(
            {
                index: this.indexEs,
                id: notifyId.toString(),
            },
            {
                ignore: [404],
            }
        );

        if (result.result === 'not_found') {
            return { message: `Notify ${notifyId} was not found in ES.` };
        }

        return { message: `Notify ${notifyId} deleted from ES.` };
    }

    async deleteByFieldId(notifyId: number) {
        const result = await this.searchService.deleteByQuery({
            index: this.indexEs,
            query: {
                match: {
                    id: notifyId,
                },
            },
        });

        return {
            deleted: result.deleted,
            message: `Deleted all documents with id = ${notifyId}`,
        };
    }
} 