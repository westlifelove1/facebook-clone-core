import { BadRequestException, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';

const allowedMimeTypes = [
  'video/mp4',
  'video/x-msvideo',      // .avi
  'video/quicktime',      // .mov
  'video/x-matroska',     // .mkv
  'video/webm',
];


@ApiTags('Backend / Common')
@Controller()
export class CommonController {
    constructor(private readonly commonService: CommonService) { }


    @Post('upload-video')
    @UseInterceptors(FileInterceptor('files', {
        storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, cb) => {
            const ext = extname(file.originalname);
            cb(null, `${Date.now()}${ext}`);
        },
        }),
        fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new BadRequestException('Only video files are allowed'), false);
        }
        },
        limits: {
        fileSize: 100 * 1024 * 1024, // 100 MB limit (optional)
        },
    }))
    uploadVideo(@UploadedFile() file: Express.Multer.File) {
        return {
        message: 'Video uploaded successfully',
        filename: file.filename,
        path: file.path,
        };
    }

    @Post('upload-videos')
    @UseInterceptors(FilesInterceptor('files', 5, {
        storage: diskStorage({
        destination: './uploads/videos',
        filename: (req, file, cb) => {
            const ext = extname(file.originalname);
            cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
        },
        }),
        fileFilter: (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new BadRequestException('Only video files are allowed'), false);
        }
        },
        limits: {
        fileSize: 100 * 1024 * 1024, // Max 100MB per file
        },
    }))
    
    uploadMultipleVideos(@UploadedFiles() files: Express.Multer.File[]) {
        return {
        message: 'Videos uploaded successfully',
        files: files.map(file => ({
            filename: file.filename,
            path: file.path,
        })),
        };
    }
    
    
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