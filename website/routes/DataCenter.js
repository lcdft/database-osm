// importing the necessary modules
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const os = require('os');
const crypto = require('crypto');
const multer = require('multer');
const AdmZip = require('adm-zip');
const sanitize = require('sanitize-filename');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tempDir = path.join(__dirname, '..', 'temp');
        // Create directory synchronously to avoid callback issues
        if (!fsSync.existsSync(tempDir)) {
            fsSync.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        // Generate secure random filename
        const randomName = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${randomName}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024 * 1024, // 2GB limit
    },
    fileFilter: (req, file, cb) => {
        const blockedExtension = ['.php', '.html', '.bat', '.exe', '.sh', '.py', '.dll', '.js', '.css'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (!blockedExtension.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed.'));
        }
    }
});

async function extractArchive(filePath, outputPath, fileType) {
    try {
        switch (fileType.toLowerCase()) {
            case '.zip':
                const zip = new AdmZip(filePath);
                await new Promise((resolve, reject) => {
                    try {
                        zip.extractAllTo(outputPath, true);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                });
                break;
            case '.rar':
                // Check for both Windows and Linux RAR paths
                const rarPaths = [
                    process.env.WINRAR_PATH || 'C:\\Program Files\\WinRAR\\WinRAR.exe',
                    process.env.LINUX_RAR_PATH || '/usr/bin/unrar'
                ];
                
                const rarPath = rarPaths.find(path => fsSync.existsSync(path));
                if (!rarPath) {
                    throw new Error('RAR/UnRAR is not installed or not found in the default locations');
                }

                // Use different commands for Windows and Linux
                const rarCommand = process.platform === 'win32' 
                    ? `"${rarPath}" x -y "${filePath}" "${outputPath}"`
                    : `"${rarPath}" x -y "${filePath}" "${outputPath}"`;
                
                await execPromise(rarCommand);
                break;
            case '.7z':
                // Check for both Windows and Linux 7-Zip paths
                const sevenZipPaths = [
                    process.env.SEVENZIP_PATH || 'C:\\Program Files\\7-Zip\\7z.exe',
                    '/usr/bin/7z',
                    '/usr/bin/7za'
                ];
                
                const sevenZipPath = sevenZipPaths.find(path => fsSync.existsSync(path));
                if (!sevenZipPath) {
                    throw new Error('7-Zip is not installed or not found in the default locations');
                }

                await execPromise(`"${sevenZipPath}" x -y "${filePath}" -o"${outputPath}"`);
                break;
            default:
                throw new Error('Unsupported archive format');
        }

        // Verify extraction succeeded
        const files = await fs.readdir(outputPath);
        if (files.length === 0) {
            throw new Error('Archive appears to be empty or extraction failed');
        }
    } catch (error) {
        throw new Error(`Extraction failed: ${error.message}`);
    }
}

module.exports = (app) => {
    app.get('/api/serverip', (req, res) => {
        const networkInterfaces = os.networkInterfaces();
        
        // Find the first non-internal IPv4 address
        let ipAddress = null;
        Object.keys(networkInterfaces).forEach((interfaceName) => {
            networkInterfaces[interfaceName].forEach((interface) => {
                if (interface.family === 'IPv4' && !interface.internal) {
                    return ipAddress = interface.address;
                }
            });
            if (ipAddress) {
                return;
            }
        });

        res.send(ipAddress);
    });
    app.get('/osm', (req, res) => {
        res.render('datacenter/HomeView');
    });
    app.post('/osm/upload', upload.array('files'), async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No files uploaded' });
            }
    
            const serverName = sanitize(req.body.serverName.toLowerCase());
            const serverKey = req.body.serverKey;
            const paths = req.body.paths.split(',');
    
            if (!serverName || !serverKey || serverName.toLowerCase() == 'upload') {
                return res.status(400).json({ error: 'Server name and key are required' });
            }
    
            // Verify server key
            const hashedKey = crypto.createHash('sha256').update(serverKey).digest('hex');
            const serverKeyPath = path.join(__dirname, '..', 'database', 'osm', `${serverName}.key`);
            
            try {
                const existingKey = await fs.readFile(serverKeyPath, 'utf8');
                if (existingKey.trim() !== hashedKey) {
                    return res.status(403).json({ error: 'Server key mismatch' });
                }
            } catch (error) {
                await fs.mkdir(path.join(__dirname, '..', 'database', 'osm'), { recursive: true });
                await fs.writeFile(serverKeyPath, hashedKey);
            }
    
            // Create base directory
            const baseDir = path.join(__dirname, '..', 'public', 'osm', serverName);
            await fs.mkdir(baseDir, { recursive: true });
    
            // Move files to their respective paths
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];
                const relativePath = paths[i];
                const targetPath = path.join(baseDir, relativePath);
                
                // Create directory if it doesn't exist
                await fs.mkdir(path.dirname(targetPath), { recursive: true });
                
                // Move file to target location
                await fs.rename(file.path, targetPath);
            }
    
            res.json({
                success: true,
                message: 'Files uploaded successfully',
                path: `/osm/${serverName}/`
            });
    
        } catch (error) {
            console.error(`[${new Date().toLocaleString()}] Upload error:`, error);
            res.status(500).json({ error: `Upload failed: ${error.message}` });
        }
    });

    // Add upload view route
    app.get('/osm/upload', (req, res) => {
        res.render('datacenter/UploadView');
    });
};