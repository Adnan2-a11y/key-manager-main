const multer = require("multer");
const fs = require("fs");
const path = require("path");
const uuid = require("uuid");
// Check if directory exists, if not create it

const doesDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const productImageDirectory = (req, file, cb) => {
  const uploadDirectory = "./uploads/products";
  doesDirectoryExists(uploadDirectory);
  cb(null, uploadDirectory);
};

const productImageStorage = multer.diskStorage({
  destination: productImageDirectory,
  filename: (req, file, cb) => {
    // Generate a unique filename using UUID
    const uniqueFilename = `${file.originalname}-${uuid.v4()}.jpg`;
    cb(null, uniqueFilename);
  },
});

const logoDirectory = (req, file, cb) => {
  const uploadDirectory = "./uploads/logo";
  doesDirectoryExists(uploadDirectory);
  cb(null, uploadDirectory);
};

const logoImageStorage = multer.diskStorage({
  destination: logoDirectory,
  filename: (req, file, cb) => {
    cb(null, "logo.png");
  },
});

const categoryImageDirectory = (req, file, cb) => {
  const uploadDirectory = "./uploads/categories";
  doesDirectoryExists(uploadDirectory);
  cb(null, uploadDirectory);
};

const categoryImageStorage = multer.diskStorage({
  destination: categoryImageDirectory,
  filename: (req, file, cb) => {
    // Generate a unique filename using UUID
    const uniqueFilename = `${file.originalname}-${uuid.v4()}.jpg`;
    cb(null, uniqueFilename);
  },
});

const galleryImgDirectory = (req, file, cb) => {
  const uploadDirectory = "./uploads/gallery";
  doesDirectoryExists(uploadDirectory);
  cb(null, uploadDirectory);
};

const galleryImageStorage = multer.diskStorage({
  destination: galleryImgDirectory,
  filename: (req, file, cb) => {
    // Generate a unique filename using UUID
    const uniqueFilename = `${file.originalname}-${uuid.v4()}.jpg`;
    cb(null, uniqueFilename);
  },
});

const uploadproductImg = multer({ storage: productImageStorage });
const uploadLogo = multer({ storage: logoImageStorage });
const uploadCategoryImg = multer({ storage: categoryImageStorage });

module.exports = { uploadLogo, uploadproductImg, uploadCategoryImg };
