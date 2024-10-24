"use strict";

const fs = require("fs");
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const log = require("../tools/log");

/**
 * @description: 创建打印窗口
 * @return {BrowserWindow} RENDER_WINDOW 打印窗口
 */
async function createRenderWindow() {
  const windowOptions = {
    width: 300, // 窗口宽度
    height: 500, // 窗口高度
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
  ipcMain.on("capturePage", (event, data) => {
    console.log(data);
    RENDER_WINDOW.setContentSize(parseInt(data.width + data.x * 2), parseInt(data.height + data.y * 2), false);
    setTimeout(() => {
      RENDER_WINDOW.webContents.capturePage({
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
      }).then((image) => {
        fs.writeFile(path.join(app.getPath("desktop"), "capture.png"), image.toPNG(), (error) => {
          if (error) {
            log.error(error);
          }
        })
      }).catch((error) => {
        log.error(error)
      })
    })
  })

  ipcMain.on("printToPDF", (event, data = {}) => {
    RENDER_WINDOW.webContents.printToPDF({
      landscape: data.landscape ?? false, // 横向打印
      displayHeaderFooter: data.displayHeaderFooter ?? false, // 显示页眉页脚
      printBackground: data.printBackground ?? true, // 打印背景色
      scale: data.scale ?? 1, // 渲染比例 默认 1
      pageSize: data.pageSize,
      margins: data.margins ?? {
        marginType: "none",
      }, // 边距
      pageRanges: data.pageRanges, // 打印页数范围
      headerTemplate: data.headerTemplate, // 页头模板 (html)
      footerTemplate: data.footerTemplate, // 页脚模板 (html)
      preferCSSPageSize: data.preferCSSPageSize ?? false,
    }).then((data) => {
      fs.writeFile(path.join(app.getPath("desktop"), "print.pdf"), data, (error) => {
        if (error) {
          log.error(error);
        }
      })
    }).catch((error) => {
      log.error(error)
    })
  })

  ipcMain.on("print", (event, data) => {
    RENDER_WINDOW.webContents.print(data, (success) => {
      console.log(success);
    })
  })
}

module.exports = async () => {
  // 创建渲染窗口
  await createRenderWindow();
}