const Media = require('../models/Media');
const { generateToken } = require('../../utils/jwt');
const uploadMultiple = require('../../utils/uploadMultiple');
const uploadOne = require('../../utils/uploadOne');
const deleteUpload = require('../../utils/deleteUpload');
const User = require('../models/User');
const UserFollow = require('../models/UserFollow');
const Comment = require('../models/Comment');
const PaymentReceipt = require('../models/PaymentReceipt');
const Report = require('../models/Report');
const Playlist = require('../models/Playlist');
const PlaylistItem = require('../models/PlaylistItem'); // Model quan hệ giữa media và playlist
const transcribeAudio = require('../../utils/speechToText');
const transcribeAudioVi = require('../../utils/speechToTextVi');
const getAudioDuration = require('../../utils/getAudioDur');
const { convertAudioToVector } = require('../../utils/audioProcessing');
const fs = require('fs').promises;
const path = require('path');
const { Op, literal, col, sequelize } = require('sequelize');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);
class MediaController {

    /** MEDIA MANAGEMENT **/
    // [POST] /media/transcribe
    static async transcribe(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            // Gọi hàm transcribeAudio và truyền buffer của file âm thanh
            const lyrics = await transcribeAudio(req.file.buffer);
            return res.status(200).json({ success: true, lyrics });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error processing file', error: error.message });
        }
    }

    // [POST] /media/transcribe/vi
    static async transcribeVi(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            // Gọi hàm transcribeAudio và truyền buffer của file âm thanh
            const lyrics = await transcribeAudioVi(req.file.buffer);
            return res.status(200).json({ success: true, lyrics });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error processing file', error: error.message });
        }
    }
// [POST] /media/create
static async create(req, res) {
    try {
        await new Promise((resolve, reject) => {
            uploadMultiple(req, res, (err) => {
                if (err) {
                    return reject({ success: false, message: 'Error uploading files', err });
                }
                resolve();
            });
        });

        const { name, artist_name, description, media_type, genre, lyric, price } = req.body;

        // Get file paths of uploaded files
        const img_url = req.files['img_url'] ? `/uploads/${req.files['img_url'][0].filename}` : null;
        const audio_url = req.files['audio_url'] ? `/uploads/${req.files['audio_url'][0].filename}` : null;

        // Validate required fields
        if (!name || !artist_name || !media_type) {
            if (img_url) deleteUpload(`public${img_url}`);
            if (audio_url) deleteUpload(`public${audio_url}`);
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        let duration = null;
        let audio_vector = null;

        if (audio_url) {
            // Calculate audio duration
            const filePath = `public${audio_url}`;
            try {
                duration = await getAudioDuration(filePath);

                // Generate audio vector using Python script
                const pythonScriptPath = path.join(__dirname, '..', '..', 'utils', 'audioToVector.py');
                const { stdout } = await execPromise(`python ${pythonScriptPath} ${filePath}`);
                audio_vector = JSON.parse(stdout);
            } catch (err) {
                console.error('Error processing audio file:', err);
                return res.status(500).json({ success: false, message: 'Error processing audio file' });
            }
        }

        // Create new media
        const newMedia = await Media.create({
            name,
            artist_name,
            img_url,
            audio_url,
            description,
            media_type,
            genre,
            lyric,
            duration,
            price,
            audio_vector,
            createdBy: req.user.id,
            created_at: new Date(),
            updated_at: new Date(),
            status: 'Pending',
        });

        return res.status(201).json({
            success: true,
            message: 'Media created successfully',
            data: newMedia,
        });
    } catch (error) {
        console.error('Error in create media:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}


// [PUT] /media/:id - Update media
static async update(req, res) {
    const { id } = req.params;
    try {
        await new Promise((resolve, reject) => {
            uploadMultiple(req, res, (err) => {
                if (err) {
                    return reject({ success: false, message: 'Error uploading files', err });
                }
                resolve();
            });
        });

        const media = await Media.findByPk(id);
        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media not found',
            });
        }

        const updateData = { ...req.body };

        if (req.files['img_url']) {
            if (media.img_url) deleteUpload(`public${media.img_url}`);
            updateData.img_url = `/uploads/${req.files['img_url'][0].filename}`;
        }

        if (req.files['audio_url']) {
            if (media.audio_url) deleteUpload(`public${media.audio_url}`);
            updateData.audio_url = `/uploads/${req.files['audio_url'][0].filename}`;

            // Recalculate audio duration if new audio file is uploaded
            const filePath = `public${updateData.audio_url}`;
            try {
                const duration = await getAudioDuration(filePath);
                updateData.duration = duration;
            } catch (err) {
                console.error('Error getting audio duration:', err);
                return res.status(500).json({ success: false, message: 'Error processing audio file' });
            }
        }

        await media.update(updateData);
        res.status(200).json({
            success: true,
            message: 'Media updated successfully',
            data: media,
        });
    } catch (error) {
        console.error('Error in update media:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating media',
            error: error.message,
        });
    }
}


// [DELETE] /media/:id
static async delete(req, res) {
    try {
        const { id } = req.params;

        const media = await Media.findByPk(id);
        if (!media) {
            return res.status(404).json({ success: false, message: 'Media not found' });
        }

        // Delete related records
        await Promise.all([
            Comment.destroy({ where: { media_id: id } }),
            Report.destroy({ where: { post_id: id } }),
            // PaymentReceipt.destroy({ where: { item_id: id, item_type: 'Song' } }),
            PlaylistItem.destroy({ where: { media_id: id } })
        ]);

        if (media.img_url) {
            await deleteUpload(`public${media.img_url}`);
        }
        if (media.audio_url) {
            await deleteUpload(`public${media.audio_url}`);
        }

        await media.destroy();

        return res.status(200).json({
            success: true,
            message: 'Media and related data deleted successfully',
        });
    } catch (error) {
        console.error('Error in delete media:', error);
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}



  // [GET] /media/:id - Lấy chi tiết một bài hát
  static async getDetail(req, res) {
    const { id } = req.params;
    const { userId } = req.query;

    try {
      const media = await Media.findOne({
        where: {
          id,
        //   status: 'Approved'  // Add this condition
        },
        attributes: {
          include: ['price'],
          exclude: ['createdBy']
        },
        include: [
          {
            model: User,
            as: 'Creator',
            required: false
          },
          {
            model: Comment,
            as: 'Comments',
            attributes: ['id', 'content', 'created_at', 'updated_at'],
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'full_name', 'email', 'img_url']
              }
            ]
          },
          {
            model: Report,
            as: 'Reports',
            attributes: ['id', 'report_type', 'description', 'status', 'created_at'],
            include: [
              {
                model: User,
                as: 'User',
                attributes: ['id', 'full_name', 'email']
              }
            ]
          }
        ]
      });

      if (!media) {
        return res.status(404).json({
          success: false,
          message: 'Media not found',
        });
      }

      let isLike = false;
      let isBuy = false;

      if (userId) {
        const favouritePlaylist = await Playlist.findOne({
          where: {
            user_id: userId,
            type: 'Favourite'
          }
        });

        if (favouritePlaylist) {
          const favouriteItem = await PlaylistItem.findOne({
            where: {
              playlist_id: favouritePlaylist.id,
              media_id: media.id
            }
          });

          if (favouriteItem) {
            isLike = true;
          }
        }

        // Check if the user has bought this media
        const payment = await PaymentReceipt.findOne({
          where: {
            user_id: userId,
            item_id: media.id,
            item_type: 'Song',
            status: 'Completed'
          }
        });

        if (payment) {
          isBuy = true;
        }
      }

      const mediaJson = media.toJSON();
      const creator = mediaJson.Creator || null;
      const comments = mediaJson.Comments || [];
      const reports = mediaJson.Reports || [];
      delete mediaJson.Creator;
      delete mediaJson.Comments;
      delete mediaJson.Reports;

      res.status(200).json({
        success: true,
        message: 'Media details retrieved successfully',
        data: {
          ...mediaJson,
          isLike,
          isBuy,
          creator,
          comments,
          reports
        },
      });
    } catch (error) {
      console.error('Error in getDetail:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving media details',
        error: error.message,
      });
    }
  }

  // [GET] /media - Lấy tất cả media
  static async getAll(req, res) {
    const { userId } = req.query;

    try {
      const medias = await Media.findAll({
        // where: {
        //   status: 'Approved'  // Add this condition
        // },
        attributes: {
          include: ['price'],
          exclude: ['createdBy']
        },
        include: [{
          model: User,
          as: 'Creator',
          attributes: ['id', 'full_name', 'email', 'img_url'],
          required: false
        }],
        order: [['created_at', 'DESC']]
      });

      let mediaWithIsLikeAndIsBuy = await Promise.all(medias.map(async (media) => {
        const mediaJson = media.toJSON();
        const creator = mediaJson.Creator || null;
        delete mediaJson.Creator;

        let isLike = false;
        let isBuy = false;

        if (userId) {
          const favouritePlaylist = await Playlist.findOne({
            where: {
              user_id: userId,
              type: 'Favourite'
            }
          });

          if (favouritePlaylist) {
            const favouriteItem = await PlaylistItem.findOne({
              where: {
                playlist_id: favouritePlaylist.id,
                media_id: media.id
              }
            });

            if (favouriteItem) {
              isLike = true;
            }
          }

          // Check if the user has bought this media
          const payment = await PaymentReceipt.findOne({
            where: {
              user_id: userId,
              item_id: media.id,
              item_type: 'Song',
              status: 'Completed'
            }
          });

          if (payment) {
            isBuy = true;
          }
        }

        return {
          ...mediaJson,
          isLike,
          isBuy,
          creator
        };
      }));

      res.status(200).json({
        success: true,
        message: 'All media retrieved successfully',
        data: mediaWithIsLikeAndIsBuy,
      });
    } catch (error) {
      console.error('Error in getAll:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving all media',
        error: error.message,
      });
    }
  }

    // [GET] /media/:id - Lấy chi tiết một bài hát
    static async getDetailUser(req, res) {
        const { id } = req.params;
        const { userId } = req.query;
    
        try {
          const media = await Media.findOne({
            where: {
              id,
              status: 'Approved'  // Add this condition
            },
            attributes: {
              include: ['price'],
              exclude: ['createdBy']
            },
            include: [
              {
                model: User,
                as: 'Creator',
                required: false
              },
              {
                model: Comment,
                as: 'Comments',
                attributes: ['id', 'content', 'created_at', 'updated_at'],
                include: [
                  {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'full_name', 'email', 'img_url']
                  }
                ]
              },
              {
                model: Report,
                as: 'Reports',
                attributes: ['id', 'report_type', 'description', 'status', 'created_at'],
                include: [
                  {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'full_name', 'email']
                  }
                ]
              }
            ]
          });
    
          if (!media) {
            return res.status(404).json({
              success: false,
              message: 'Media not found',
            });
          }
    
          let isLike = false;
          let isBuy = false;
    
          if (userId) {
            const favouritePlaylist = await Playlist.findOne({
              where: {
                user_id: userId,
                type: 'Favourite'
              }
            });
    
            if (favouritePlaylist) {
              const favouriteItem = await PlaylistItem.findOne({
                where: {
                  playlist_id: favouritePlaylist.id,
                  media_id: media.id
                }
              });
    
              if (favouriteItem) {
                isLike = true;
              }
            }
    
            // Check if the user has bought this media
            const payment = await PaymentReceipt.findOne({
              where: {
                user_id: userId,
                item_id: media.id,
                item_type: 'Song',
                status: 'Completed'
              }
            });
    
            if (payment) {
              isBuy = true;
            }
          }
    
          const mediaJson = media.toJSON();
          const creator = mediaJson.Creator || null;
          const comments = mediaJson.Comments || [];
          const reports = mediaJson.Reports || [];
          delete mediaJson.Creator;
          delete mediaJson.Comments;
          delete mediaJson.Reports;
    
          res.status(200).json({
            success: true,
            message: 'Media details retrieved successfully',
            data: {
              ...mediaJson,
              isLike,
              isBuy,
              creator,
              comments,
              reports
            },
          });
        } catch (error) {
          console.error('Error in getDetail:', error);
          res.status(500).json({
            success: false,
            message: 'Error retrieving media details',
            error: error.message,
          });
        }
      }
    
      // [GET] /media - Lấy tất cả media
      static async getAllUser(req, res) {
        const { userId } = req.query;
    
        try {
          const medias = await Media.findAll({
            where: {
              status: 'Approved'  // Add this condition
            },
            attributes: {
              include: ['price'],
              exclude: ['createdBy']
            },
            include: [{
              model: User,
              as: 'Creator',
              attributes: ['id', 'full_name', 'email', 'img_url'],
              required: false
            }],
            order: [['created_at', 'DESC']]
          });
    
          let mediaWithIsLikeAndIsBuy = await Promise.all(medias.map(async (media) => {
            const mediaJson = media.toJSON();
            const creator = mediaJson.Creator || null;
            delete mediaJson.Creator;
    
            let isLike = false;
            let isBuy = false;
    
            if (userId) {
              const favouritePlaylist = await Playlist.findOne({
                where: {
                  user_id: userId,
                  type: 'Favourite'
                }
              });
    
              if (favouritePlaylist) {
                const favouriteItem = await PlaylistItem.findOne({
                  where: {
                    playlist_id: favouritePlaylist.id,
                    media_id: media.id
                  }
                });
    
                if (favouriteItem) {
                  isLike = true;
                }
              }
    
              // Check if the user has bought this media
              const payment = await PaymentReceipt.findOne({
                where: {
                  user_id: userId,
                  item_id: media.id,
                  item_type: 'Song',
                  status: 'Completed'
                }
              });
    
              if (payment) {
                isBuy = true;
              }
            }
    
            return {
              ...mediaJson,
              isLike,
              isBuy,
              creator
            };
          }));
    
          res.status(200).json({
            success: true,
            message: 'All media retrieved successfully',
            data: mediaWithIsLikeAndIsBuy,
          });
        } catch (error) {
          console.error('Error in getAll:', error);
          res.status(500).json({
            success: false,
            message: 'Error retrieving all media',
            error: error.message,
          });
        }
      }

  // [GET] /media/pending - Lấy tất cả media có trạng thái pending
  static async getPendingMedia(req, res) {
    const { userId } = req.query;

    try {
      const pendingMedias = await Media.findAll({
        where: {
          status: 'Pending'
        },
        attributes: {
          include: ['price'],
          exclude: ['createdBy']
        },
        include: [{
          model: User,
          as: 'Creator',
          attributes: ['id', 'full_name', 'email', 'img_url'],
          required: false
        }],
        order: [['created_at', 'DESC']]
      });

      let pendingMediaWithIsLikeAndIsBuy = await Promise.all(pendingMedias.map(async (media) => {
        const mediaJson = media.toJSON();
        const creator = mediaJson.Creator || null;
        delete mediaJson.Creator;

        let isLike = false;
        let isBuy = false;

        if (userId) {
          const favouritePlaylist = await Playlist.findOne({
            where: {
              user_id: userId,
              type: 'Favourite'
            }
          });

          if (favouritePlaylist) {
            const favouriteItem = await PlaylistItem.findOne({
              where: {
                playlist_id: favouritePlaylist.id,
                media_id: media.id
              }
            });

            if (favouriteItem) {
              isLike = true;
            }
          }

          // Check if the user has bought this media
          const payment = await PaymentReceipt.findOne({
            where: {
              user_id: userId,
              item_id: media.id,
              item_type: 'Song',
              status: 'Completed'
            }
          });

          if (payment) {
            isBuy = true;
          }
        }

        return {
          ...mediaJson,
          isLike,
          isBuy,
          creator
        };
      }));

      res.status(200).json({
        success: true,
        message: 'All pending media retrieved successfully',
        data: pendingMediaWithIsLikeAndIsBuy,
      });
    } catch (error) {
      console.error('Error in getPendingMedia:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving pending media',
        error: error.message,
      });
    }
  }

  static async getByUser(req, res) {
    const user = req.user;
    try {
      const medias = await Media.findAll({ 
        where: { 
          createdBy: user.id
        },
        attributes: {
          include: ['price']
        }
      });

      // Fetch user's playlists
      const playlists = await Playlist.findAll({
        where: {
          user_id: user.id,
          type: 'Playlist'
        }
      });

      // Fetch user's albums
      const albums = await Playlist.findAll({
        where: {
          user_id: user.id,
          type: 'Album'
        }
      });

      // Add isLike and isBuy properties to medias
      const mediasWithIsLikeAndIsBuy = await Promise.all(medias.map(async (media) => {
        const payment = await PaymentReceipt.findOne({
          where: {
            user_id: user.id,
            item_id: media.id,
            item_type: 'Song',
            status: 'Completed'
          }
        });

        return {
          ...media.toJSON(),
          isLike: true, // Since these are the user's own media, we can assume they like them
          isBuy: true // Convert to boolean
        };
      }));

      res.status(200).json({
        success: true,
        message: `Media and playlists for user ${user.id} retrieved successfully`,
        data: {
          medias: mediasWithIsLikeAndIsBuy,
          playlists,
          albums
        },
      });
    } catch (error) {
      console.error('Error in getByUser:', error);
      res.status(500).json({
        success: false,
        message: `Error retrieving media and playlists for user ${user.id}`,
        error: error.message,
      });
    }
  }


    /** PLAYLIST MANAGEMENT **/



  // Cập nhật phương thức getByPlaylist
  static async getByPlaylist(req, res) {
    const { playlistId } = req.params;
    const { userId } = req.query;

    try {
      // Lấy thông tin của playlist
      const playlist = await Playlist.findOne({
        where: { id: playlistId },
      });

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: `Playlist with id ${playlistId} not found`,
        });
      }

      // Lấy tất cả bài hát trong playlist
      const playlistItems = await PlaylistItem.findAll({
        where: { playlist_id: playlistId },
      });

      const mediaIds = playlistItems.map(item => item.media_id);
      const medias = await Media.findAll({
        where: { id: mediaIds },
      });

      // Kiểm tra isBuy cho playlist (nếu là album) và từng bài hát
      let playlistIsBuy = false;
      if (userId && playlist.type === 'Album') {
        const playlistPayment = await PaymentReceipt.findOne({
          where: {
            user_id: userId,
            item_id: playlist.id,
            item_type: 'Album',
            status: 'Completed'
          }
        });
        playlistIsBuy = !!playlistPayment;
      }

      const mediasWithIsBuy = await Promise.all(medias.map(async (media) => {
        let isBuy = playlistIsBuy; // Nếu đã mua album thì tất cả các bài hát đều được coi là đã mua
        if (!isBuy && userId) {
          const payment = await PaymentReceipt.findOne({
            where: {
              user_id: userId,
              item_id: media.id,
              item_type: 'Song',
              status: 'Completed'
            }
          });
          isBuy = !!payment;
        }
        return {
          ...media.toJSON(),
          isBuy
        };
      }));

      // Trả về thông tin của playlist, số lượng bài hát và danh sách bài hát trong data
      res.status(200).json({
        success: true,
        message: `Media in playlist/album ${playlistId} retrieved successfully`,
        data: {
          playlist: {
            id: playlist.id,
            name: playlist.name,
            genre: playlist.genre,
            artist_name: playlist.artist_name,
            img_url: playlist.img_url,
            type: playlist.type,
            song_count: mediasWithIsBuy.length,
            isBuy: playlistIsBuy
          },
          medias: mediasWithIsBuy,
        },
      });
    } catch (error) {
      console.error('Error in getByPlaylist:', error);
      res.status(500).json({
        success: false,
        message: `Error retrieving media in playlist/album ${playlistId}`,
        error: error.message,
      });
    }
  }
    // Cập nhật phương thức getByAlbum thành getByPlaylist
    static async getByPlaylist(req, res) {
        const { playlistId } = req.params;
    
        try {
            // Lấy thông tin của playlist
            const playlist = await Playlist.findOne({
                where: { id: playlistId },
            });
    
            if (!playlist) {
                return res.status(404).json({
                    success: false,
                    message: `Playlist with id ${playlistId} not found`,
                });
            }
    
            // Lấy tất cả bài hát trong playlist
            const playlistItems = await PlaylistItem.findAll({
                where: { playlist_id: playlistId },
            });
    
            const mediaIds = playlistItems.map(item => item.media_id);
            const medias = await Media.findAll({
                where: { id: mediaIds },
            });
    
            // Trả về thông tin của playlist, số lượng bài hát và danh sách bài hát trong data
            res.status(200).json({
                success: true,
                message: `Media in playlist/album ${playlistId} retrieved successfully`,
                data: {
                    playlist: {
                        id: playlist.id,
                        name: playlist.name,
                        genre: playlist.genre,
                        artist_name: playlist.artist_name,
                        img_url: playlist.img_url,
                        type: playlist.type,
                        song_count: medias.length, // Đếm số lượng bài hát
                    },
                    medias, // Danh sách bài hát
                },
            });
        } catch (error) {
            console.error('Error in getByPlaylist:', error);
            res.status(500).json({
                success: false,
                message: `Error retrieving media in playlist/album ${playlistId}`,
                error: error.message,
            });
        }
    }

  // [GET] /playlists/me - Lấy playlist theo người dùng
  static async getPlaylistsByUser(req, res) {
    const user = req.user;
    try {
      // Tìm tất cả playlist được tạo bởi người dùng
      const playlists = await Playlist.findAll({ where: { user_id: user.id, type: "Playlist" } });
  
      // Tính tổng số lượng bài hát trong mỗi playlist
      const playlistsWithItemCount = await Promise.all(playlists.map(async (playlist) => {
        const totalItems = await PlaylistItem.count({ where: { playlist_id: playlist.id } });
        return {
          ...playlist.toJSON(),
          totalItems, // Thêm tổng số lượng bài hát
        };
      }));
  
      res.status(200).json({
        success: true,
        message: `Playlists created by user ${user.id} retrieved successfully`,
        data: playlistsWithItemCount,
      });
    } catch (error) {
      console.error('Error in getPlaylistsByUser:', error);
      
      // Xử lý lỗi từ server
      res.status(500).json({
        success: false,
        message: `Error retrieving playlists created by user ${user.id}`,
        error: error.message,
      });
    }
  }





  // Cập nhật phương thức addToAlbum và addToPlaylist thành addToPlaylist
  static async addToPlaylist(req, res) {
    const { mediaId } = req.body;  // Lấy mediaId từ request body
    const { playlistId } = req.params;  // Lấy playlistId từ URL params
    
    try {
        // Kiểm tra xem playlist có tồn tại không
        const playlist = await Playlist.findByPk(playlistId);
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist/Album not found',
            });
        }

        // Kiểm tra xem media có tồn tại không
        const media = await Media.findByPk(mediaId);
        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media not found',
            });
        }

        // Thêm media vào playlist
        await PlaylistItem.create({ playlist_id: playlistId, media_id: mediaId });

        res.status(200).json({
            success: true,
            message: 'Media added to playlist/album successfully',
        });
    } catch (error) {
        console.error('Error in addToPlaylist:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding media to playlist/album',
            error: error.message,
        });
    }
}

  static async deletePlaylist(req, res) {
    try {
      const { id } = req.params;

      const playlist = await Playlist.findByPk(id);
      if (!playlist) {
        return res.status(404).json({ success: false, message: 'Playlist not found' });
      }

      // Delete the associated image file if it exists
      if (playlist.img_url) {
        deleteUpload(`public${playlist.img_url}`);
      }

      // Delete all associated playlist items
      await PlaylistItem.destroy({ where: { playlist_id: id } });

      // Delete the playlist
      await playlist.destroy();

      return res.status(200).json({
        success: true,
        message: 'Playlist deleted successfully',
      });
    } catch (error) {
      console.error('Error in delete playlist:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }

  // Cập nhật phương thức removeFromAlbum và removeFromPlaylist thành removeFromPlaylist
  static async removeFromPlaylist(req, res) {
    const { mediaId } = req.body;
    const playlistId = req.params.id
    try {
      const playlistItem = await PlaylistItem.findOne({ where: { playlist_id: playlistId, media_id: mediaId } });

      if (!playlistItem) {
        return res.status(404).json({
          success: false,
          message: 'Media not found in playlist/album',
        });
      }

      await playlistItem.destroy();

      res.status(200).json({
        success: true,
        message: 'Media removed from playlist/album successfully',
      });
    } catch (error) {
      console.error('Error in removeFromPlaylist:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing media from playlist/album',
        error: error.message,
      });
    }
  }

  // Thêm phương thức createPlaylist
  static async createPlaylist(req, res) {
    try {
      await new Promise((resolve, reject) => {
        uploadOne(req, res, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
  
      const { name, genre, artist_name, type } = req.body;
      let img_url = null;
  
      if (req.file) {
        img_url = `/uploads/${req.file.filename}`;
      }
  
      const newPlaylist = await Playlist.create({
        name,
        genre,
        artist_name,
        user_id: req.user.id,
        type,
        img_url
      });
  
      res.status(201).json({
        success: true,
        message: 'Playlist/Album created successfully',
        data: newPlaylist,
      });
    } catch (error) {
      console.error('Error in createPlaylist:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating playlist/album',
        error: error.message,
      });
    }
  }

  static async updatePlaylist(req, res) {
    try {
      await new Promise((resolve, reject) => {
        uploadOne(req, res, (err) => {
          if (err) {
            return reject({ success: false, message: 'Error uploading files', err });
          }
          resolve();
        });
      });

      const { playlistId } = req.params;
      const playlist = await Playlist.findByPk(playlistId);

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist not found',
        });
      }

      const updateData = { ...req.body };

      if (req.file) {
        if (playlist.img_url) {
          await deleteUpload(`public${playlist.img_url}`);
        }
        updateData.img_url = `/uploads/${req.file.filename}`;
      }

      await playlist.update(updateData);

      const updatedPlaylist = await Playlist.findByPk(playlistId, {
        include: [{
          model: PlaylistItem,
          include: [Media]
        }]
      });

      res.status(200).json({
        success: true,
        message: 'Playlist updated successfully',
        data: updatedPlaylist,
      });
    } catch (error) {
      console.error('Error in updatePlaylist:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating playlist',
        error: error.message,
      });
    }
  }


  static async search(req, res) {
    const { q: query, userId } = req.query;
    try {
      const medias = await Media.findAll({
        where: {
          name: {
            [Op.iLike]: `%${query}%`,
          },
          status: 'Approved'  // Add this condition to only retrieve approved media
        },
        attributes: {
          include: ['price'],
          exclude: ['createdBy']
        },
        include: [{
          model: User,
          as: 'Creator',
          attributes: ['id', 'full_name', 'email', 'img_url'],
          required: false
        }]
      });
  
      let mediaWithIsLikeAndIsBuy = await Promise.all(medias.map(async (media) => {
        const mediaJson = media.toJSON();
        const creator = mediaJson.Creator || null;
        delete mediaJson.Creator;
  
        let isLike = false;
        let isBuy = false;
  
        if (userId) {
          const favouritePlaylist = await Playlist.findOne({
            where: {
              user_id: userId,
              type: 'Favourite'
            }
          });
  
          if (favouritePlaylist) {
            const favouriteItem = await PlaylistItem.findOne({
              where: {
                playlist_id: favouritePlaylist.id,
                media_id: media.id
              }
            });
  
            if (favouriteItem) {
              isLike = true;
            }
          }
  
          // Check if the user has bought this media
          const payment = await PaymentReceipt.findOne({
            where: {
              user_id: userId,
              item_id: media.id,
              item_type: 'Song',
              status: 'Completed'
            }
          });
  
          if (payment) {
            isBuy = true;
          }
        }
  
        return {
          ...mediaJson,
          isLike,
          isBuy,
          creator
        };
      }));
  
      res.status(200).json({
        success: true,
        message: 'Search results retrieved successfully',
        data: mediaWithIsLikeAndIsBuy,
      });
    } catch (error) {
      console.error('Error in search:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching for media',
        error: error.message,
      });
    }
  }


    // [POST] /playlists/favourite - Tạo playlist yêu thích cho người dùng
static async createFavouritePlaylist(req, res) {
    const user = req.user;
    try {
        // Kiểm tra xem người dùng đã có playlist yêu thích chưa
        let favouritePlaylist = await Playlist.findOne({
            where: {
                user_id: user.id,
                type: 'Favourite'
            }
        });

        if (favouritePlaylist) {
            return res.status(200).json({
                success: true,
                message: 'Favourite playlist already exists',
                data: favouritePlaylist
            });
        }

        // Tạo mới playlist yêu thích nếu chưa tồn tại
        favouritePlaylist = await Playlist.create({
            name: 'Favourite',
            genre: 'Pop',
            artist_name: user.name, // hoặc user.name tùy thuộc vào trường dữ liệu người dùng
            user_id: user.id,
            type: 'favourite',
            img_url: null  // Có thể thêm hình ảnh mặc định cho playlist nếu cần
        });

        res.status(201).json({
            success: true,
            message: 'Favourite playlist created successfully',
            data: favouritePlaylist,
        });
    } catch (error) {
        console.error('Error in createFavouritePlaylist:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating favourite playlist',
            error: error.message,
        });
    }

    
}

// [POST] /playlists/favourite/add - Thêm nhạc vào playlist yêu thích 
static async addToFavourite(req, res) {
    const user = req.user;
    const { mediaId } = req.body;  // Lấy mediaId từ request body

    try {
        // Kiểm tra xem người dùng đã có playlist yêu thích chưa
        let favouritePlaylist = await Playlist.findOne({
            where: {
                user_id: user.id,
                type: 'Favourite'
            }
        });

        // Nếu chưa có playlist yêu thích, tạo mới
        if (!favouritePlaylist) {
            favouritePlaylist = await Playlist.create({
                name: 'Favourite',
                genre: 'Pop',
                artist_name: user.name, // Hoặc user.name tùy thuộc vào thông tin người dùng
                user_id: user.id,
                type: 'Favourite',
                img_url: null  // Có thể thêm hình ảnh mặc định cho playlist nếu cần
            });
        }

        // Kiểm tra xem media có tồn tại không
        const media = await Media.findByPk(mediaId);
        if (!media) {
            return res.status(404).json({
                success: false,
                message: 'Media not found',
            });
        }

        // Kiểm tra nếu nhạc đã có trong playlist yêu thích
        const existingItem = await PlaylistItem.findOne({
            where: {
                playlist_id: favouritePlaylist.id,
                media_id: mediaId
            }
        });

        // Nếu bài hát đã có trong playlist, không cần thêm nữa
        if (existingItem) {
            return res.status(200).json({
                success: true,
                message: 'Media already in favourite playlist',
            });
        }

        // Thêm media vào playlist yêu thích
        await PlaylistItem.create({
            playlist_id: favouritePlaylist.id,
            media_id: mediaId
        });

        // Đếm lại số lượt yêu thích của bài hát sau khi thêm vào playlist
        const favouriteCount = await PlaylistItem.count({
            where: { media_id: mediaId }
        });

        // Cập nhật lại likes_count của media
        await Media.update(
            { likes_count: favouriteCount },
            { where: { id: mediaId } }
        );

        res.status(200).json({
            success: true,
            message: 'Media added to favourite playlist successfully and likes_count updated',
        });
    } catch (error) {
        console.error('Error in addToFavourite:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding media to favourite playlist',
            error: error.message,
        });
    }
}




static async deleteFavourite(req, res) {
    const user = req.user;
    const { mediaId } = req.query;  // Lấy mediaId từ request query

    // Kiểm tra xem mediaId có phải là số hợp lệ không
    if (!mediaId || isNaN(mediaId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid mediaId provided',
        });
    }

    try {
        // Kiểm tra xem người dùng đã có playlist yêu thích chưa
        const favouritePlaylist = await Playlist.findOne({
            where: {
                user_id: user.id,
                type: 'Favourite'
            }
        });

        // Nếu không có playlist yêu thích
        if (!favouritePlaylist) {
            return res.status(404).json({
                success: false,
                message: 'Favourite playlist not found',
            });
        }

        // Kiểm tra xem media có tồn tại trong playlist không
        const existingItem = await PlaylistItem.findOne({
            where: {
                playlist_id: favouritePlaylist.id,
                media_id: mediaId
            }
        });

        // Nếu media không có trong playlist
        if (!existingItem) {
            return res.status(404).json({
                success: false,
                message: 'Media not found in favourite playlist',
            });
        }

        // Xóa media khỏi playlist yêu thích
        await PlaylistItem.destroy({
            where: {
                playlist_id: favouritePlaylist.id, // Chỉ định playlist_id để xóa chính xác
                media_id: mediaId // Xóa theo media_id
            }
        });

        // Đếm lại số lượt yêu thích của bài hát sau khi xóa khỏi playlist yêu thích
        const favouriteCount = await PlaylistItem.count({
            where: { media_id: mediaId }
        });

        // Cập nhật lại likes_count của media
        await Media.update(
            { likes_count: favouriteCount },
            { where: { id: mediaId } }
        );

        res.status(200).json({
            success: true,
            message: 'Media removed from favourite playlist successfully and likes_count updated',
        });
    } catch (error) {
        console.error('Error in deleteFavourite:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing media from favourite playlist',
            error: error.message,
        });
    }
}



static async getAllFavourite(req, res) {
    const user = req.user;

    try {
      const favouritePlaylist = await Playlist.findOne({
        where: {
          user_id: user.id,
          type: 'Favourite',
        },
        attributes: ['id'],
      });

      if (!favouritePlaylist) {
        return res.status(404).json({
          success: false,
          message: 'Favourite playlist not found for the user',
        });
      }

      const playlistItems = await PlaylistItem.findAll({
        where: {
          playlist_id: favouritePlaylist.id,
        },
        attributes: ['media_id'],
      });

      const mediaIds = playlistItems.map(item => item.media_id);

      const mediaItems = await Media.findAll({
        where: {
          id: mediaIds,
        },
      });

      const mediaWithLikeAndBuyInfo = await Promise.all(mediaItems.map(async (media) => {
        let isLike = true; // Always true for favourite playlist items
        let isBuy = false;

        // Check if the user has bought this media
        const payment = await PaymentReceipt.findOne({
          where: {
            user_id: user.id,
            item_id: media.id,
            item_type: 'Song',
            status: 'Completed'
          }
        });

        if (payment) {
          isBuy = true;
        }

        return {
          ...media.toJSON(),
          isLike,
          isBuy,
        };
      }));

      res.status(200).json({
        success: true,
        message: 'Favourite playlist retrieved successfully',
        data: mediaWithLikeAndBuyInfo,
      });
    } catch (error) {
      console.error('Error in getAllFavourite:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving favourite playlist',
        error: error.message,
      });
    }
  }

  static async getTopSongs(req, res) {
    const { userId } = req.query;
  
    try {
      const songs = await Media.findAll({
        where: {
          media_type: 'Song',
          status: 'Approved'  // Add this condition to only retrieve approved media
        },
        attributes: {
          include: ['price', 'likes_count', 'comments_count'],
          exclude: ['createdBy']
        },
        include: [{
          model: User,
          as: 'Creator',
          attributes: ['id', 'full_name', 'email', 'img_url'],
          required: false
        }]
      });
  
      // Sort songs by the sum of likes_count and comments_count
      const sortedSongs = songs.sort((a, b) => {
        const scoreA = (a.likes_count || 0) + (a.comments_count || 0);
        const scoreB = (b.likes_count || 0) + (b.comments_count || 0);
        return scoreB - scoreA;
      });
  
      // Get top 5 songs
      const topSongs = sortedSongs.slice(0, 5);
  
      let topSongsWithIsLikeAndIsBuy = await Promise.all(topSongs.map(async (media) => {
        const mediaJson = media.toJSON();
        const creator = mediaJson.Creator || null;
        delete mediaJson.Creator;
  
        let isLike = false;
        let isBuy = false;
  
        if (userId) {
          const favouritePlaylist = await Playlist.findOne({
            where: {
              user_id: userId,
              type: 'Favourite'
            }
          });
  
          if (favouritePlaylist) {
            const favouriteItem = await PlaylistItem.findOne({
              where: {
                playlist_id: favouritePlaylist.id,
                media_id: media.id
              }
            });
  
            if (favouriteItem) {
              isLike = true;
            }
          }
  
          // Check if the user has bought this media
          const payment = await PaymentReceipt.findOne({
            where: {
              user_id: userId,
              item_id: media.id,
              item_type: 'Song',
              status: 'Completed'
            }
          });
  
          if (payment) {
            isBuy = true;
          }
        }
  
        return {
          ...mediaJson,
          isLike,
          isBuy,
          creator
        };
      }));
  
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Top 5 songs retrieved successfully.",
        data: topSongsWithIsLikeAndIsBuy
      });
    } catch (error) {
      console.error('Error in getTopSongs:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "Error retrieving top 5 songs.",
        error: error.message
      });
    }
  }
  
  
  static async getUserContent(req, res) {
    const { userId } = req.params;
    const { currentUserId } = req.query; // Add this to check if the current user has bought the content

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const playlists = await Playlist.findAll({
        where: { user_id: userId, type: 'Playlist' }
      });

      const albums = await Playlist.findAll({
        where: { user_id: userId, type: 'Album' }
      });

      const songs = await Media.findAll({
        where: { createdBy: userId,
            status: 'Approved'
         }
      });

      // Add isBuy information for albums and songs
      const albumsWithBuyInfo = await Promise.all(albums.map(async (album) => {
        let isBuy = false;
        if (currentUserId) {
          const payment = await PaymentReceipt.findOne({
            where: {
              user_id: currentUserId,
              item_id: album.id,
              item_type: 'Album',
              status: 'Completed'
            }
          });
          isBuy = !!payment;
        }
        return { ...album.toJSON(), isBuy };
      }));

      const songsWithBuyInfo = await Promise.all(songs.map(async (song) => {
        let isBuy = false;
        if (currentUserId) {
          const payment = await PaymentReceipt.findOne({
            where: {
              user_id: currentUserId,
              item_id: song.id,
              item_type: 'Song',
              status: 'Completed'
            }
          });
          isBuy = !!payment;
        }
        return { ...song.toJSON(), isBuy };
      }));

      res.status(200).json({
        success: true,
        message: 'User content retrieved successfully',
        data: {
          playlists,
          albums: albumsWithBuyInfo,
          songs: songsWithBuyInfo
        }
      });
    } catch (error) {
      console.error('Error in getUserContent:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving user content',
        error: error.message
      });
    }
  }


  static async searchByMelody(req, res) {
    let uploadedFile = null;
    try {
      const { userId } = req.query;
  
      // Use the uploadOne function to handle file upload
      await new Promise((resolve, reject) => {
        uploadOne(req, res, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
  
      if (!req.file) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: 'No audio file was uploaded',
          data: null
        });
      }
  
      uploadedFile = req.file.path;
  
      // Convert audio to vector using Python script
      const pythonScriptPath = path.join(__dirname, '..', '..', 'utils', 'audioToVector.py');
      const { stdout } = await execPromise(`python ${pythonScriptPath} ${uploadedFile}`);
      const audioVector = JSON.parse(stdout);
  
      // Function to calculate cosine similarity
      const cosineSimilarity = (vec1, vec2) => {
        const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
        const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitude1 * magnitude2);
      };
  
      // Get all media records with audio vectors
      const allMedia = await Media.findAll({
        where: {
          audio_vector: {
            [Op.not]: null,
          },
          status: 'Approved'

        },
        attributes: {
          include: ['id', 'name', 'artist_name', 'audio_vector', 'img_url', 'audio_url', 'duration', 'description', 'lyric', 'media_type', 'genre', 'likes_count', 'comments_count', 'reports_count', 'price', 'status', 'created_at', 'updated_at'],
          exclude: ['createdBy']
        },
        include: [{
          model: User,
          as: 'Creator',
          attributes: ['id', 'full_name', 'email', 'img_url'],
          required: false
        }]
      });
  
      // Calculate similarity scores and add additional information
      const mediaWithScores = await Promise.all(allMedia.map(async (media) => {
        const mediaJson = media.toJSON();
        const creator = mediaJson.Creator || null;
        delete mediaJson.Creator;
  
        let isLike = false;
        let isBuy = false;
  
        if (userId) {
          const favouritePlaylist = await Playlist.findOne({
            where: {
              user_id: userId,
              type: 'Favourite'
            }
          });
  
          if (favouritePlaylist) {
            const favouriteItem = await PlaylistItem.findOne({
              where: {
                playlist_id: favouritePlaylist.id,
                media_id: media.id
              }
            });
  
            if (favouriteItem) {
              isLike = true;
            }
          }
  
          // Check if the user has bought this media
          const payment = await PaymentReceipt.findOne({
            where: {
              user_id: userId,
              item_id: media.id,
              item_type: 'Song',
              status: 'Completed'
            }
          });
  
          if (payment) {
            isBuy = true;
          }
        }
  
        return {
          ...mediaJson,
          similarityScore: cosineSimilarity(audioVector, media.audio_vector),
          isLike,
          isBuy,
          creator
        };
      }));
  
      // Sort by similarity score (descending)
      mediaWithScores.sort((a, b) => b.similarityScore - a.similarityScore);
  
      // Return top 10 most similar results
      const topResults = mediaWithScores.slice(0, 10);
  
      res.status(200).json({
        success: true,
        status: 200,
        message: 'Search results based on melody retrieved successfully',
        data: topResults,
      });
    } catch (error) {
      console.error('Error in searchByMelody:', error);
      res.status(500).json({
        success: false,
        status: 500,
        message: 'Error when searching media based on melody',
        data: null,
        error: error.message,
      });
    } finally {
      // Cleanup: delete the uploaded file
      if (uploadedFile) {
        try {
          await fs.unlink(uploadedFile);
        } catch (err) {
          console.error('Error when deleting uploaded file:', err);
        }
      }
    }
  }


      static async approveMedia(req, res) {
        try {
          const { mediaId } = req.params;
          const { status, approvalNote } = req.body;
          const adminId = req.user.id;
      
          // Check if the user is an admin or staff
          if (req.user.role !== 'Admin' && req.user.role !== 'Staff') {
            return res.status(403).json({
              success: false,
              status: 403,
              message: "Unauthorized. Only Admin or Staff can approve media.",
            });
          }
      
          // Find the media
          const media = await Media.findByPk(mediaId);
          if (!media) {
            return res.status(404).json({
              success: false,
              status: 404,
              message: "Media not found.",
            });
          }
      
          // Update media status
          if (status !== 'Approved' && status !== 'Rejected' && status !== 'Pending' && status !== 'Reported') {
            return res.status(400).json({
              success: false,
              status: 400,
              message: "Invalid status. Must be 'Approved' or Pending or 'Rejected'.",
            });
          }
      
          media.status = status;
          media.approvedBy = adminId;
      
          // If rejected, add the approval note
          if (status === 'Rejected' && approvalNote) {
            media.description = media.description ? 
              `${media.description}\n\nRejection reason: ${approvalNote}` : 
              `Rejection reason: ${approvalNote}`;
          }
      
          await media.save();
      
          return res.status(200).json({
            success: true,
            status: 200,
            message: `Media ${status.toLowerCase()} successfully.`,
            data: {
              id: media.id,
              name: media.name,
              status: media.status,
              approvedBy: media.approvedBy,
              description: media.description
            }
          });
      
        } catch (error) {
          console.error('Error in approveMedia:', error);
          return res.status(500).json({
            success: false,
            status: 500,
            message: "An error occurred while approving the media.",
            error: error.message
          });
        }
      }

     // [GET] /media/genre/:genre - Lấy danh sách media theo thể loại
//   static async getByGenre(req, res) {
//     const { genre } = req.params;
//     const { userId } = req.query;

//     try {
//       const mediaList = await Media.findAll({
//         where: { genre },
//         include: [{
//           model: User,
//           as: 'Creator',
//           attributes: ['id', 'full_name', 'email', 'img_url'],
//           required: false
//         }]
//       });

//       const mediaWithBuyInfo = await Promise.all(mediaList.map(async (media) => {
//         const mediaJson = media.toJSON();
//         const creator = mediaJson.Creator || null;
//         delete mediaJson.Creator;

//         let isBuy = false;

//         if (userId) {
//           const payment = await PaymentReceipt.findOne({
//             where: {
//               user_id: userId,
//               item_id: media.id,
//               item_type: 'Song',
//               status: 'Completed'
//             }
//           });

//           if (payment) {
//             isBuy = true;
//           }
//         }

//         return {
//           ...mediaJson,
//           isBuy,
//           creator
//         };
//       }));

//       res.status(200).json({
//         success: true,
//         message: `Media list for genre "${genre}" retrieved successfully`,
//         data: mediaWithBuyInfo,
//       });
//     } catch (error) {
//       console.error('Error in getByGenre:', error);
//       res.status(500).json({
//         success: false,
//         message: `Error retrieving media list for genre "${genre}"`,
//         error: error.message,
//       });
//     }
//   }

  // [GET] /media/podcasts - Lấy danh sách podcast
  static async getPodcasts(req, res) {
    const { userId } = req.query;

    try {
      const podcasts = await Media.findAll({
        where: { media_type: 'Podcast' },
        include: [{
          model: User,
          as: 'Creator',
          attributes: ['id', 'full_name', 'email', 'img_url'],
          required: false
        }]
      });

      const podcastsWithBuyInfo = await Promise.all(podcasts.map(async (podcast) => {
        const podcastJson = podcast.toJSON();
        const creator = podcastJson.Creator || null;
        delete podcastJson.Creator;

        let isBuy = false;

        if (userId) {
          const payment = await PaymentReceipt.findOne({
            where: {
              user_id: userId,
              item_id: podcast.id,
              item_type: 'Podcast',
              status: 'Completed'
            }
          });

          if (payment) {
            isBuy = true;
          }
        }

        return {
          ...podcastJson,
          isBuy,
          creator
        };
      }));

      res.status(200).json({
        success: true,
        message: 'Podcast list retrieved successfully',
        data: podcastsWithBuyInfo,
      });
    } catch (error) {
      console.error('Error in getPodcasts:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving podcast list',
        error: error.message,
      });
    }
  }   
  static async getAllPlaylistAttachments(req, res) {
    try {
      const playlists = await Playlist.findAll({
        attributes: [
          'id', 'name', 'genre', 'artist_name', 'img_url', 'type', 'price', 'created_at', 'likes_count', 'comments_count'
        ],
        where: {type: 'Album'},
        include: [
          {
            model: User,
            attributes: ['id', 'full_name', 'email'],
            as: 'User'
          },
          {
            model: PlaylistItem,
            attributes: [],
            as: 'PlaylistItems'
          }
        ],
        group: ['Playlist.id', 'User.id'],
        subQuery: false
      });

      const playlistsWithSongCount = await Promise.all(playlists.map(async (playlist) => {
        const songCount = await PlaylistItem.count({
          where: { playlist_id: playlist.id }
        });

        return {
          ...playlist.toJSON(),
          song_count: songCount
        };
      }));

      return res.status(200).json({
        success: true,
        status: 200,
        message: "Lấy thông tin tất cả playlist thành công.",
        data: playlistsWithSongCount
      });
    } catch (error) {
      console.error('Error in getAllPlaylistAttachments:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "Lỗi khi lấy thông tin playlist.",
        error: error.message
      });
    }
  }

  static async getTopFollowedUsersAttachment(req, res) {
    try {
      const topUsers = await User.findAll({
        attributes: [
          'id',
          'full_name',
          'email',
          'img_url',
          [
            literal('(SELECT COUNT(*) FROM user_follows WHERE user_follows.following_id = "User".id)'),
            'follower_count'
          ]
        ],
        order: [
          [literal('follower_count'), 'DESC']
        ],
        limit: 3
      });
  
      const formattedUsers = topUsers.map(user => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        img_url: user.img_url,
        follower_count: parseInt(user.get('follower_count'), 10)
      }));
  
      return res.status(200).json({
        success: true,
        status: 200,
        message: "Lấy thông tin 5 người dùng có nhiều lượt follow nhất thành công.",
        data: formattedUsers
      });
    } catch (error) {
      console.error('Error in getTopFollowedUsersAttachment:', error);
      return res.status(500).json({
        success: false,
        status: 500,
        message: "Lỗi khi lấy thông tin người dùng có nhiều lượt follow nhất.",
        error: error.message
      });
    }
  }
  
  
  
  static async getMediaFromFollowedUsers(req, res) {
  const userId = req.query.userId;;

  try {
    // Get the IDs of users that the current user is following
    const followedUsers = await UserFollow.findAll({
      where: { follower_id: userId },
      attributes: ['following_id']
    });

    const followedUserIds = followedUsers.map(follow => follow.following_id);

    // Get media (songs and podcasts) from followed users
    const media = await Media.findAll({
      where: {
        createdBy: { [Op.in]: followedUserIds },
        status: 'Approved',
        media_type: { [Op.in]: ['Song', 'Podcast'] }
      },
      include: [{
        model: User,
        as: 'Creator',
        attributes: ['id', 'full_name', 'email', 'img_url']
      }],
      order: [['created_at', 'DESC']]
    });

    // Add isLike and isBuy information
    const mediaWithInfo = await Promise.all(media.map(async (item) => {
      const mediaJson = item.toJSON();
      const creator = mediaJson.Creator;
      delete mediaJson.Creator;

      let isLike = false;
      let isBuy = false;

      const favouritePlaylist = await Playlist.findOne({
        where: { user_id: userId, type: 'Favourite' }
      });

      if (favouritePlaylist) {
        const favouriteItem = await PlaylistItem.findOne({
          where: { playlist_id: favouritePlaylist.id, media_id: item.id }
        });
        isLike = !!favouriteItem;
      }

      const payment = await PaymentReceipt.findOne({
        where: {
          user_id: userId,
          item_id: item.id,
          item_type: item.media_type,
          status: 'Completed'
        }
      });
      isBuy = !!payment;

      return {
        ...mediaJson,
        isLike,
        isBuy,
        creator
      };
    }));

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Media from followed users retrieved successfully.",
      data: mediaWithInfo
    });
  } catch (error) {
    console.error('Error in getMediaFromFollowedUsers:', error);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Error retrieving media from followed users.",
      error: error.message
    });
  }}
  
  
  static async getPurchasedSongsByUser(req, res) {
    const user = req.user;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
  
    try {
      const { count, rows: purchasedSongs } = await PaymentReceipt.findAndCountAll({
        where: {
          user_id: user.id,
          item_type: 'Song',
          status: 'Completed'
        },
        include: [
          {
            model: Media,
            as: 'MediaItem',
            include: [
              {
                model: User,
                as: 'Creator',
                attributes: ['id', 'full_name', 'email', 'img_url']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });
  
      const favouritePlaylist = await Playlist.findOne({
        where: {
          user_id: user.id,
          type: 'Favourite'
        },
        include: [{
          model: Media,
          through: PlaylistItem,
          attributes: ['id']
        }]
      });
  
      const favouriteMediaIds = favouritePlaylist ? favouritePlaylist.Media.map(media => media.id) : [];
  
      const formattedPurchasedSongs = purchasedSongs.map(receipt => {
        if (!receipt.MediaItem) {
          console.error(`No Media found for receipt ${receipt.id}`);
          return null;
        }
  
        const mediaItem = receipt.MediaItem;
        return {
          id: mediaItem.id,
          name: mediaItem.name,
          artist_name: mediaItem.artist_name,
          img_url: mediaItem.img_url,
          audio_url: mediaItem.audio_url,
          duration: mediaItem.duration,
          description: mediaItem.description,
          lyric: mediaItem.lyric,
          media_type: mediaItem.media_type,
          genre: mediaItem.genre,
          likes_count: mediaItem.likes_count,
          comments_count: mediaItem.comments_count,
          reports_count: mediaItem.reports_count,
          audio_vector: mediaItem.audio_vector,
          price: mediaItem.price,
          deletedBy: mediaItem.deletedBy,
          approvedBy: mediaItem.approvedBy,
          created_at: mediaItem.created_at,
          updated_at: mediaItem.updated_at,
          status: mediaItem.status,
          isLike: favouriteMediaIds.includes(mediaItem.id),
          isBuy: true,
          creator: mediaItem.Creator
        };
      }).filter(song => song !== null);
  
      return res.status(200).json({
        success: true,
        message: "Successfully retrieved purchased songs information.",
        data: formattedPurchasedSongs
      });
    } catch (error) {
      console.error('Error in getPurchasedSongsByUser:', error);
      return res.status(500).json({
        success: false,
        message: "An error occurred while retrieving purchased songs information.",
        error: error.message
      });
    }}

}


module.exports = MediaController;
