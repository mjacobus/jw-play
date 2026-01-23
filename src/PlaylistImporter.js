const AdmZip = require("adm-zip");
const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");
const os = require("os");

class PlaylistImporter {
  #zipPath = null;
  #tempDir = null;
  #filesDir = null;
  #db = null;

  constructor(zipPath, filesDir) {
    this.#zipPath = zipPath;
    this.#filesDir = filesDir;
  }

  async import(mediaFiles) {
    try {
      this.#extract();
      await this.#openDatabase();
      const items = this.#getPlaylistItems();

      const importedFiles = [];
      for (const item of items) {
        const file = this.#importItem(item, mediaFiles);
        if (file) {
          importedFiles.push(file);
        }
      }

      return importedFiles;
    } finally {
      this.#cleanup();
    }
  }

  #extract() {
    this.#tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "jwplaylist-"));
    const zip = new AdmZip(this.#zipPath);
    zip.extractAllTo(this.#tempDir, true);
  }

  async #openDatabase() {
    const SQL = await initSqlJs();
    const dbPath = path.join(this.#tempDir, "userData.db");
    const buffer = fs.readFileSync(dbPath);
    this.#db = new SQL.Database(buffer);
  }

  #getPlaylistItems() {
    // Query playlist items in order, joining with IndependentMedia to get the actual media files
    const query = `
      SELECT
        pi.PlaylistItemId,
        pi.Label,
        im.OriginalFilename,
        im.FilePath,
        im.MimeType
      FROM PlaylistItem pi
      JOIN PlaylistItemIndependentMediaMap pim ON pi.PlaylistItemId = pim.PlaylistItemId
      JOIN IndependentMedia im ON pim.IndependentMediaId = im.IndependentMediaId
      ORDER BY pi.PlaylistItemId
    `;

    const results = this.#db.exec(query);
    if (!results.length) {
      return [];
    }

    const columns = results[0].columns;
    return results[0].values.map((row) => {
      const item = {};
      columns.forEach((col, index) => {
        item[col] = row[index];
      });
      return item;
    });
  }

  #importItem(item, mediaFiles) {
    const sourceFile = path.join(this.#tempDir, item.FilePath);

    if (!fs.existsSync(sourceFile)) {
      console.warn(`Source file not found: ${sourceFile}`);
      return null;
    }

    // Use the Label as the filename (it contains the original name)
    const label = item.Label;
    const ext = path.extname(label) || this.#getExtFromMime(item.MimeType);
    const baseName = path.basename(label, ext);

    // Create a unique filename to avoid conflicts
    const uniqueFilename = `${baseName}_${Date.now()}${ext}`;
    const importedDir = path.join(this.#filesDir, "imported");
    const destPath = path.join(importedDir, uniqueFilename);

    // Ensure the imported directory exists
    fs.mkdirSync(importedDir, { recursive: true });

    // Copy the file to the permanent location
    fs.copyFileSync(sourceFile, destPath);

    // Create the media file entry with the playlist item's label as title
    return mediaFiles.createFromPath(destPath, { title: item.Label });
  }

  #getExtFromMime(mimeType) {
    const mimeToExt = {
      "video/mp4": ".mp4",
      "video/mpeg": ".mpeg",
      "video/quicktime": ".mov",
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
    };
    return mimeToExt[mimeType] || "";
  }

  #cleanup() {
    if (this.#db) {
      this.#db.close();
      this.#db = null;
    }
    // Clean up the temp directory since files have been copied to the permanent location
    if (this.#tempDir && fs.existsSync(this.#tempDir)) {
      fs.rmSync(this.#tempDir, { recursive: true, force: true });
      this.#tempDir = null;
    }
  }
}

module.exports = PlaylistImporter;
