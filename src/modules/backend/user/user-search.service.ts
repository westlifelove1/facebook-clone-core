import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';


@Injectable()
export class UserSearchService implements OnApplicationBootstrap{

    private readonly indexEs = 'users';
    constructor(private readonly elasticsearchService: ElasticsearchService) {}

    async onApplicationBootstrap() {
        console.log('[UserSearchService] Initializing Elasticsearch index...');

        const exists = await this.elasticsearchService.indices.exists({ index: this.indexEs });
        if (!exists) {
            await this.elasticsearchService.indices.create({
                index: this.indexEs,
                body: {
                    mappings: {
                        properties: {
                            id: { type: 'integer' },
                            fullname: { type: 'text' },
                            email: { type: 'text' },
                            displayname: { type: 'text' },
                            bio: { type: 'text' },
                            phone: { type: 'text' },
                            workingPlace: { type: 'text' },
                        },
                    },
                },
            });
            console.log('Index "users" has been created and mapped.');
        }
    }

    async indexUser(document: any) {
    return await this.elasticsearchService.index({
      index: this.indexEs,
      id: document.id.toString(),
      document,
    });
  }

    async deleteUserFromIndex(userId: number) {
    const result = await this.elasticsearchService.delete({
      index: this.indexEs,
      id: userId.toString(),
    }, {
      ignore: [404],
    });

    if (result.result === 'not_found') {
      return { message: `User ${userId} not found in Elasticsearch.` };
    }

    return { message: `User ${userId} deleted from Elasticsearch.` };
  }

  async searchUsers(q?: string, page = 1, limit = 10) {
    const from = (page - 1) * limit;

    const query: any = q
      ? {
          multi_match: {
            query: q,
            fields: ['fullname', 'email', 'phone', 'displayname', 'bio', 'workingPlace'],
            fuzziness: 'auto',
          },
        }
      : { match_all: {} };

    const result = await this.elasticsearchService.search({ index: this.indexEs, from, size: limit, query,});

    const data = result.hits.hits.map(hit => hit._source);
    const total = typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0;

    return { data, total, page, limit };
  }

}
