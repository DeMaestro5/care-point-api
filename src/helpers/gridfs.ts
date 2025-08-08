import { GridFSBucket, ObjectId, Db } from 'mongodb';
import mongoose from 'mongoose';

export interface GridFSUploadResult {
  fileId: ObjectId;
  filename: string;
  contentType: string;
  length: number;
}

export async function uploadToGridFS({
  buffer,
  filename,
  mimetype,
  uploadedBy,
}: {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  uploadedBy: string;
}): Promise<GridFSUploadResult> {
  // Use the existing mongoose connection
  const db: Db = mongoose.connection.db;
  if (!db) {
    throw new Error('MongoDB connection is not established');
  }
  const bucket = new GridFSBucket(db);

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimetype,
      metadata: { uploadedBy },
    });

    uploadStream.on('error', (err: any) => {
      reject(err);
    });

    uploadStream.on('finish', async () => {
      try {
        // Get the file ID from the upload stream
        const fileId = uploadStream.id;

        if (!fileId) {
          throw new Error('No file ID received from GridFS');
        }

        const result: GridFSUploadResult = {
          fileId,
          filename,
          contentType: mimetype,
          length: buffer.length,
        };

        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    uploadStream.end(buffer);
  });
}
