import multer from 'multer';
import path from 'path';
import fs from 'node:fs';
import { BadRequestException } from '../middleware/error.middleware';
import { Request } from 'express';

function createStorage(uploadDir: string) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, '../../../images', uploadDir);
      // if folder does not exist
      if (!fs.existsSync(uploadPath)) {
        // create folder upload dir name
        fs.mkdirSync(uploadPath);
      }

      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  });
  return storage;
}

function fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Make sure file is image
  console.log(file.mimetype);
  if (!file.mimetype.startsWith('image/')) {
    cb(new BadRequestException('File must be image'));
  }

  cb(null, true);
}

const limits = {
  fileSize: 5 * 1024 * 1024 // 5mb
};

export const upload = multer({ storage: createStorage('products'), fileFilter, limits });
export const uploadAvatar = multer({ storage: createStorage('users') });
