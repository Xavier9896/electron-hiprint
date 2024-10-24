"use strict";

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const log = require("../tools/log");

/**
 * @description: 创建打印窗口
 * @return {BrowserWindow} RENDER_WINDOW 打印窗口
 */
async function createRenderWindow() {
  const windowOptions = {
    width: 100, // 窗口宽度
    height: 100, // 窗口高度
    show: true, // 不显示
    webPreferences: {
      contextIsolation: false, // 设置此项为false后，才可在渲染进程中使用electron api
      nodeIntegration: true,
    },
  };

  // 创建打印窗口
  RENDER_WINDOW = new BrowserWindow(windowOptions);

  // 加载打印渲染进程页面
  let printHtml = path.join("file://", app.getAppPath(), "/assets/render.html");
  RENDER_WINDOW.webContents.loadURL(printHtml);

  // 未打包时打开开发者工具
  // if (!app.isPackaged) {
  RENDER_WINDOW.webContents.openDevTools();
  // }

  // 绑定窗口事件
  initEvent();

  return RENDER_WINDOW;
}

function initEvent() {
  ipcMain.on("render", (event, data) => {
    console.log(data);
  })
}

module.exports = async () => {
  // 创建渲染窗口
  await createRenderWindow();
}