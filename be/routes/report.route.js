const express = require('express');
const router = express.Router();
const ReportController = require('../app/controllers/report.controller'); // Adjust the path as needed
const authenticateToken = require('../app/middlewares/verify.middleware');

// [POST] /reports - Create a new report
router.post('/', authenticateToken, (req, res) => {
    ReportController.createReport(req, res).catch((error) => {
        console.error('Create Report Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to create report',
                status: 500,
            },
        });
    });
});
// // [GET] /reports/:id - Get a specific report
// router.get('/:id', (req, res) => {
//     ReportController.getReportById(req, res).catch((error) => {
//         console.error('Get Report By ID Error:', error);
//         res.status(500).json({
//             success: false,
//             status: 500,
//             error: {
//                 name: 'server_error',
//                 message: 'Failed to fetch report',
//                 status: 500,
//             },
//         });
//     });
// });

// [GET]/reports/media/:id
router.get('/media/:id', (req, res) => {
    ReportController.getReportsByMediaId(req, res).catch((error) => {
        console.error('Get Report By ID Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to fetch report',
                status: 500,
            },
        });
    });
});

// [GET] /reports - Get all reports
router.get('/', (req, res) => {
    ReportController.getAllReports(req, res).catch((error) => {
        console.error('Get All Reports Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to fetch reports',
                status: 500,
            },
        });
    });
});


// [PUT] /reports/:id - Update a report status
router.put('/:id', authenticateToken, (req, res) => {
    ReportController.updateReportStatus(req, res).catch((error) => {
        console.error('Update Report Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to update report',
                status: 500,
            },
        });
    });
});

// [DELETE] /reports/:id - Delete a report
router.delete('/:id', authenticateToken, (req, res) => {
    ReportController.deleteReport(req, res).catch((error) => {
        console.error('Delete Report Error:', error);
        res.status(500).json({
            success: false,
            status: 500,
            error: {
                name: 'server_error',
                message: 'Failed to delete report',
                status: 500,
            },
        });
    });
});

module.exports = router;