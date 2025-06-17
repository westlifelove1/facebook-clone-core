import { Controller, Inject } from '@nestjs/common';
import { Payload, EventPattern } from '@nestjs/microservices';
import { NotifySearchService } from './notify-search.service';

@Controller()
export class NotifyMicroservice {
    constructor(
        private readonly NotifySearchService: NotifySearchService,
    ) {}

    @EventPattern('index_notify')
    async handleMessage(@Payload() data: { index: string; document: any }) {
        console.log('handleIndexNotify', data);
        return this.NotifySearchService.indexNotify(data.document);
    }

    @EventPattern('delete_notify_index')
    async handleDeletePostIndex(@Payload() data: { notifyId: number }) {
        return this.NotifySearchService.deleteNotifyFromIndex(data.notifyId);
    }
} 