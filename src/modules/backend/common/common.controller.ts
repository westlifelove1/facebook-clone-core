import { BadRequestException, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Backend / Common')
@Controller()
export class CommonController {
    constructor(private readonly commonService: CommonService) { }

    @Post('upload-image')
    @UseInterceptors(FilesInterceptor('files', 10))
    @ApiOperation({ summary: 'Upload an image file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    format: 'binary',
                    description: 'Image files to upload (supported formats: jpg, jpeg, png, gif)'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Image uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                paths: {
                    type: 'array',
                    items: {
                        type: 'string',
                        description: 'Path to the uploaded image',
                    },
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request - No file uploaded'
    })
    async uploadImage(@UploadedFiles() files: Express.Multer.File[]) {
       if (!files || files.length === 0) {
        throw new BadRequestException('No files uploaded');
        }

        // const filePath = await this.commonService.uploadImage(files);
        // return {
        //     path: filePath
        // };

        const filePaths = await Promise.all(
             files.map((file) => this.commonService.uploadImage(file)),
        );
        return {
            paths: filePaths,
        };
    }
}