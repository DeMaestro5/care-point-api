console.log('GridFS helper module is being loaded');
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
  console.log('Starting GridFS upload process');
  console.log('Upload parameters:', {
    filename,
    mimetype,
    uploadedBy,
    bufferLength: buffer.length,
  });

  // Use the existing mongoose connection
  const db: Db = mongoose.connection.db;
  if (!db) {
    console.log('MongoDB connection is not established');
    throw new Error('MongoDB connection is not established');
  }
  console.log('MongoDB connection is established');
  const bucket = new GridFSBucket(db);

  return new Promise((resolve, reject) => {
    console.log('Creating upload stream');
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimetype,
      metadata: { uploadedBy },
    });

    uploadStream.on('error', (err: any) => {
      console.log('Upload stream error:', err);
      reject(err);
    });

    uploadStream.on('finish', async () => {
      console.log('Upload finished successfully');

      try {
        // Get the file ID from the upload stream
        const fileId = uploadStream.id;
        console.log('File ID from stream:', fileId);

        if (!fileId) {
          throw new Error('No file ID received from GridFS');
        }

        const result: GridFSUploadResult = {
          fileId,
          filename,
          contentType: mimetype,
          length: buffer.length,
        };

        console.log('Created result object:', JSON.stringify(result, null, 2));
        resolve(result);
      } catch (error) {
        console.log('Error processing file object:', error);
        reject(error);
      }
    });

    console.log('Writing buffer to stream');
    uploadStream.end(buffer);
  });
}
