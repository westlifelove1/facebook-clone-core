import { Controller, Inject } from '@nestjs/common';
import { Payload, EventPattern } from '@nestjs/microservices';
import { PostSearchService } from './post-search.service';

@Controller()
export class PostMicroservice {
    constructor(
        private readonly PostSearchService: PostSearchService,
    ) {}

    @EventPattern('index_post')
    async handleMessage(@Payload() data: { index: string; document: any }) {
        // console.log('handleIndexPost', data);
        return this.PostSearchService.indexPost(data.document);
    }

    @EventPattern('delete_post_index')
    async handleDeletePostIndex(@Payload() data: { id: number }) {
        return this.PostSearchService.deletePostFromIndex(data.id);
    }
} 