const express = require('express');
const router = express.Router();
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { prepareFileBuffer } = require('../utils/prepareFileForGemini');
const { extractTextFromFile } = require('../services/geminiFileReader');
const { generateInsights } = require('../services/geminiService');
const Class = require('../models/Class');

require('dotenv').config({ path: '../.env' });

// AWS Config
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

// -----------------
// POST /api/classes/create
// -----------------
router.post('/create', async (req, res) => {
  const { title, description, userId } = req.body;
  try {
    const newClass = new Class({ title, description, userId }); // ✅ SAVE userId
    await newClass.save();
    res.json(newClass);
  } catch (error) {
    console.error('CREATE CLASS ERROR:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});
  
// -----------------
// POST /api/classes/upload
// -----------------
router.post('/upload', (req, res) => {
    const upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.AWS_BUCKET_NAME,
            metadata: (req, file, cb) => {
                cb(null, { fieldName: file.fieldname });
            },
            key: (req, file, cb) => {
                const filename = `${Date.now()}-${file.originalname}`;
                cb(null, filename);
            }
        })
    }).single('file');

    upload(req, res, async function (err) {
        if (err) {
            console.error('UPLOAD ERROR:', err);
            return res.status(500).json({ error: 'Failed to upload file' });
        }

        const { classId, category, userId } = req.body;

        try {
            const existingClass = await Class.findOne({ _id: classId, userId: userId });
            if (!existingClass) {
                return res.status(404).json({ error: 'Class not found for this user' });
            }

            const newFile = {
                filename: req.file.key,
                category,
                path: req.file.location,
            };
            existingClass.files.push(newFile);
            await existingClass.save();

            const fileUrl = req.file.location;
            const mimetype = req.file.mimetype;

            const { pageBuffers, cleanMimetype } = await prepareFileBuffer(fileUrl, mimetype);
            const base64Images = pageBuffers.map(pageBuffer => 
                Buffer.from(pageBuffer).toString('base64')
              );
              

            const extractedText = await extractTextFromFile(base64Images);
            const courseDescription = existingClass.description;
            const type = existingClass.type;
            const courseInsights = existingClass.insights;
            const aiInsights = await generateInsights(extractedText, courseDescription, type, courseInsights);

            existingClass.insights = aiInsights;
            await existingClass.save();

            res.json({
                message: 'File uploaded and AI insights generated successfully!',
                fileUrl: req.file.location
            });

        } catch (error) {
            console.error('UPLOAD+AI ERROR:', error.response?.data || error.message);
            res.status(500).json({ error: 'Failed to process upload and generate insights.' });
        }
    });
});

// -----------------
// GET /api/classes/insights/:classId/:userId
// -----------------
router.get('/insights/:classId/:userId', async (req, res) => {
    const { classId, userId } = req.params;
    try {
        const existingClass = await Class.findOne({ _id: classId, userId: userId });
        if (!existingClass) {
            return res.status(404).json({ error: 'Class not found for this user' });
        }
        res.json({ insights: existingClass.insights });
    } catch (error) {
        console.error('GET INSIGHTS ERROR:', error);
        res.status(500).json({ error: 'Failed to fetch insights' });
    }
});

// -----------------
// GET /api/classes/all/:userId
// -----------------
router.get('/all/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const classes = await Class.find({ userId: userId }); // ✅ FIXED userId
        res.json(classes);
    } catch (error) {
        console.error('GET ALL CLASSES ERROR:', error);
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
});

module.exports = router;
