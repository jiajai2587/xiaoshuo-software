const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow
let browserWindow

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    },
    icon: path.join(__dirname, '../public/icon.png')
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

function createBrowserWindow() {
  browserWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  browserWindow.loadURL('https://chat.deepseek.com')

  browserWindow.on('ready-to-show', () => {
    browserWindow.show()
  })
}

app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('save-file', async (event, { filePath, content }) => {
  try {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      return { success: true, content }
    }
    return { success: false, error: '文件不存在' }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  })
  return result
})

ipcMain.handle('list-files', async (event, dirPath) => {
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath)
      return { success: true, files }
    }
    return { success: false, error: '目录不存在' }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('delete-file', async (event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      return { success: true }
    }
    return { success: false, error: '文件不存在' }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('open-browser', () => {
  if (!browserWindow) {
    createBrowserWindow()
  } else {
    browserWindow.focus()
  }
})

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData')
})
