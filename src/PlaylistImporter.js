const AdmZip = require("adm-zip");
const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { uuid } = require("./utils");

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

    // Safe extraction: validate each entry to prevent path traversal
    for (const entry of zip.getEntries()) {
      const entryName = path.normalize(entry.entryName).replace(/^([/\\])+/, "");
      const destPath = path.join(this.#tempDir, entryName);

      // Skip entries that would escape the temp directory
      if (!destPath.startsWith(this.#tempDir + path.sep)) {
        continue;
      }

      if (entry.isDirectory) {
        fs.mkdirSync(destPath, { recursive: true });
      } else {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.writeFileSync(destPath, entry.getData());
      }
    }
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
    // Prevent path traversal: resolve and validate the source path
    const sourceFile = path.resolve(this.#tempDir, item.FilePath);
    if (!sourceFile.startsWith(this.#tempDir + path.sep)) {
      console.warn(`Rejected playlist item due to invalid path: ${item.FilePath}`);
      return null;
    }

    if (!fs.existsSync(sourceFile)) {
      console.warn(`Source file not found: ${sourceFile}`);
      return null;
    }

    // Sanitize label for use in filename (remove unsafe characters)
    const label = item.Label;
    const ext = path.extname(label) || this.#getExtFromMime(item.MimeType);
    const baseName = this.#sanitizeFilename(path.basename(label, ext));

    // Create a unique filename using uuid to avoid collisions
    const uniqueFilename = `${baseName}_${uuid()}${ext}`;
    const importedDir = path.join(this.#filesDir, "imported");
    const destPath = path.join(importedDir, uniqueFilename);

    // Ensure the imported directory exists
    fs.mkdirSync(importedDir, { recursive: true });

    // Copy the file to the permanent location
    fs.copyFileSync(sourceFile, destPath);

    // Create the media file entry with the playlist item's label as title
    return mediaFiles.createFromPath(destPath, { title: item.Label });
  }

  #sanitizeFilename(name) {
    // Remove characters that are unsafe for filenames across platforms
    return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
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
