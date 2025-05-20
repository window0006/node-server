// 调通上层目录 src 中的方法
import { renderPage } from '@client/utils/render-page';
// 处理 ts es 文件引用
export function core() {
  const pageHtml = renderPage();
  return pageHtml;
}

function getLangCfg() {}

function getPageCfg() {}

function getPageHtml() {}
