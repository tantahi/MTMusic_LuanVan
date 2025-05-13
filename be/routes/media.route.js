const express = require('express');
const router = express.Router();
const authenticateToken = require('../app/middlewares/verify.middleware');
const MediaController = require('../app/controllers/media.controller');
const { mediaValidation } = require('../app/middlewares/validators/media.validator');
const { validationResult } = require('express-validator');
const { requireAdmin } = require('../app/middlewares/role.middleware');
const uploadMultiple = require('../utils/uploadMultiple');
const multer = require('multer');

// Cấu hình multer để lưu file trong bộ nhớ tạm thời
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/followed', MediaController.getMediaFromFollowedUsers);

router.get('/purchase-song', authenticateToken, MediaController.getPurchasedSongsByUser);

router.get('/purchesed/song', authenticateToken, MediaController.getPurchasedSongsByUser)
// New route for top 5 songs
router.get('/top-songs', (req, res) => {
    MediaController.getTopSongs(req, res);
  });

      // [get] /media/top/user
      router.get('/top/user', (req, res) => {
        MediaController.getTopFollowedUsersAttachment(req, res);
      })
// Route xử lý upload file
router.post('/upload', uploadMultiple, (req, res) => {
  console.log(req.files);
  
  if (!req.files || !req.files.img_url || !req.files.audio_url) {
    return res.status(400).json({ message: 'Please upload both img_url and audio_url' });
  }

  const imgFile = req.files.img_url[0];
  const audioFile = req.files.audio_url[0];

  res.json({
    message: 'Files uploaded successfully!',
    imgFile: imgFile.filename,
    audioFile: audioFile.filename,
  });
});

// Route xử lý file audio transcription
router.post('/transcribe', upload.single('audio'), (req, res) => { 
  MediaController.transcribe(req, res);
});

// Route xử lý file audio transcription
router.post('/transcribe/vi', upload.single('audio'), (req, res) => { 
    MediaController.transcribeVi(req, res);
  });
  

// [POST] /media/create - Tạo mới media
router.post('/create', authenticateToken, mediaValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: {
        name: 'validation',
        message: 'Validation failed',
        status: 400,
        details: errors.array(),
      },
    });
  }
  
  MediaController.create(req, res);
});

router.get('/playlist/favourite', authenticateToken, MediaController.getAllFavourite);
router.post('/playlist/favourite', authenticateToken, MediaController.createFavouritePlaylist);
router.post('/playlist/favourite/addd', authenticateToken, MediaController.addToFavourite);
router.delete('/playlist/favourite/delete', authenticateToken, MediaController.deleteFavourite);

// [DELETE] /media/:id - Xóa media theo ID
router.delete('/:id', authenticateToken, (req, res) => {
  MediaController.delete(req, res);
});

// [PUT] /media/:id - Cập nhật media
router.put('/:id', authenticateToken, mediaValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      status: 400,
      error: {
        name: 'validation',
        message: 'Validation failed',
        status: 400,
        details: errors.array(),
      },
    });
  }
  
  MediaController.update(req, res);
});

// // [GET] /media/for-user/:id - Lấy chi tiết media theo ID
// router.get('foruser/:id', (req, res) => {
//     MediaController.getDetailUser(req, res);
// });

// [GET] /media - Lấy tất cả media
router.get('/', (req, res) => {
  MediaController.getAll(req, res);
});

// [GET] /media/user - Lấy tất cả media
router.get('/user', (req, res) => {
    MediaController.getAllUser(req, res);
  });

  // [GET] /media/pending
  router.get('/pending', (req, res) => {
    MediaController.getPendingMedia(req, res);
  });

// [GET] /media/status/:status - Lấy media theo status
router.get('/status/:status', (req, res) => {
  MediaController.getByStatus(req, res);
});

// [GET] /media/genre/:genre - Lấy media theo thể loại
router.get('/genre/:genre', (req, res) => {
  MediaController.getByGenre(req, res);
});

// [GET] /media/user/:userId - Lấy media theo người dùng
router.get('/user/:userId', authenticateToken, (req, res) => {
  MediaController.getByUser(req, res);
});

// [GET] /media/search - Tìm kiếm media theo tên, nghệ sĩ, hoặc thể loại
router.get('/search', (req, res) => {
  MediaController.search(req, res);
});

// [GET] /playlist - Lấy tất cả playlist/album
router.get('/playlist', (req, res) => {
  MediaController.getAllPlaylistAttachments(req, res);
});

// [GET] /playlist/me - Lấy playlist của người dùng hiện tại
router.get('/playlist/me', authenticateToken, (req, res) => {
  MediaController.getPlaylistsByUser(req, res);
});

// [GET] /playlist/:playlistId - Lấy media theo playlist
router.get('/playlist/:playlistId', (req, res) => {
  MediaController.getByPlaylist(req, res);
});

// [POST] /playlist/create - Tạo mới playlist/album
router.post('/playlist/create', authenticateToken, (req, res) => {
  MediaController.createPlaylist(req, res);
});

router.put('/playlist/:playlistId', authenticateToken, (req, res) => {
    MediaController.updatePlaylist(req, res);
  });

// [POST] /playlist/:playlistId/add - Thêm media vào playlist/album
router.post('/playlist/:playlistId/add', authenticateToken, (req, res) => {
  MediaController.addToPlaylist(req, res);
});

// [DELETE] /playlist/:playlistId/remove - Xóa media khỏi playlist/album
router.delete('/playlist/:id/remove', authenticateToken, (req, res) => {
  MediaController.removeFromPlaylist(req, res);
});

// [DELETE] /playlist/:id - Xóa playlist/album
router.delete('/playlist/:id', authenticateToken, (req, res) => {
  MediaController.deletePlaylist(req, res);
});



// [GET] /media/:id - Lấy chi tiết media theo ID
router.get('/:id', (req, res) => {
  MediaController.getDetail(req, res);
});



router.post('/search-by-melody', MediaController.searchByMelody);


  
  // New route for user's content
  router.get('/user-content/:userId', authenticateToken, (req, res) => {
    MediaController.getUserContent(req, res);
  });
  
  // [POST] /media/approval
  router.post('/approval/:mediaId', authenticateToken, (req, res) => {
    MediaController.approveMedia(req, res);
  })



module.exports = router;
