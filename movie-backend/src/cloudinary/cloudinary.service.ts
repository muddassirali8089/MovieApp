/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: 'dujmvhjyt',
      api_key: process.env.CLOUDINARY_API_KEY || '326117899546833',
      api_secret: process.env.CLOUDINARY_API_SECRET || '3Ko_by9cM9Zj0c2VLM0_J1tIkfI',
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'users'): Promise<string> {
    try {
      // Convert buffer to stream
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'image',
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result && result.secure_url) {
              resolve(result.secure_url);
            } else {
              reject(new Error('Upload failed: No result received'));
            }
          }
        );

        stream.pipe(uploadStream);
      });
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }
}
