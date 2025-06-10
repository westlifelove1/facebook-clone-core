import { Controller } from '@nestjs/common';
import { Payload, EventPattern } from '@nestjs/microservices';
import { SearchService } from '../search/search.service'

@Controller()
export class CommentMicroservice {
    constructor(
        private readonly searchService: SearchService,
    ) {}

    // Khi có comment mới được tạo, se index comment vào ES
    @EventPattern('index_comment')
    async handleIndexComment(@Payload() data: { index: string; document: any }) {
        console.log('handleIndexComment', data);
        return this.searchService.indexComment(data.document);
    }

    // Khi có comment được xoá, se xoá comment khỏi ES
    @EventPattern('delete_comment_index')
    async handleDeletecommentIndex(@Payload() data: { commentId: number }) {
        return this.searchService.removeComment(data.commentId);
    }
} 