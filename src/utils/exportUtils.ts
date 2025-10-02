import html2canvas from 'html2canvas';

// 导出为图片并复制到剪贴板 - 直接截取页面中的公式
export const exportAsImage = async (element: HTMLElement): Promise<void> => {
  try {
    // 找到公式渲染的容器
    const formulaElement = element.querySelector('.katex-display, .katex') || element;
    
    if (!formulaElement) {
      throw new Error('未找到公式元素');
    }
    
    // 等待一小段时间确保渲染完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 直接截取页面中的公式元素
    const canvas = await html2canvas(formulaElement as HTMLElement, {
      backgroundColor: '#ffffff',
      scale: 2, // 适中的缩放比例
      useCORS: true,
      allowTaint: true,
      logging: false,
      foreignObjectRendering: false,
      removeContainer: true,
      // 让html2canvas自动计算尺寸
      onclone: (clonedDoc) => {
        // 确保克隆文档中的样式正确
        const clonedElement = clonedDoc.querySelector('.katex-display, .katex');
        if (clonedElement) {
          // 保持原有的渲染效果，只确保颜色正确
          clonedElement.style.color = '#000000';
          clonedElement.style.backgroundColor = '#ffffff';
        }
      }
    });

    // 将canvas转换为blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          throw new Error('无法生成图片');
        }
      }, 'image/png');
    });

    // 复制到剪贴板
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob
      })
    ]);

    console.log('图片已复制到剪贴板');
  } catch (error) {
    console.error('导出图片失败:', error);
    throw new Error('导出图片失败，请重试');
  }
};

// 导出为HTML和纯文本格式并复制到剪贴板
export const exportAsHTML = async (formula: string): Promise<void> => {
  // 创建一个临时容器来渲染公式
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.top = '-9999px';
  tempContainer.style.left = '-9999px';
  document.body.appendChild(tempContainer);
  
  try {
    // 使用KaTeX渲染公式
    if (typeof (window as any).katex !== 'undefined') {
      (window as any).katex.render(`\\ce{${formula}}`, tempContainer, {
        throwOnError: false,
        displayMode: true,
        trust: true,
        strict: false,
        // 确保中文字符正确显示
        macros: {
          "\\text": "\\text"
        }
      });
      
      // 获取渲染后的HTML内容
      const renderedHTML = tempContainer.innerHTML;
      
      // 生成完整的HTML文档
      const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>化学公式</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css">
    <style>
        body {
            font-family: "Microsoft YaHei", "SimSun", Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f8f9fa;
        }
        .formula-container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .formula {
            font-size: 24px;
            color: #2c3e50;
            margin: 20px 0;
        }
        /* 确保KaTeX中的中文字符正确显示 */
        .katex {
            font-family: "KaTeX_Main", "Microsoft YaHei", "SimSun", Arial, sans-serif;
        }
        .katex .mord {
            font-family: "KaTeX_Main", "Microsoft YaHei", "SimSun", Arial, sans-serif;
        }
    </style>
</head>
<body>
    <div class="formula-container">
        <h1>化学公式</h1>
        <div class="formula">
            ${renderedHTML}
        </div>
    </div>
</body>
</html>`;
      
      // 获取纯文本内容（去除HTML标签）
      const textContent = tempContainer.textContent || tempContainer.innerText || formula;
      
      // 同时写入HTML和纯文本格式到剪贴板
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([textContent], { type: 'text/plain' })
        })
      ]);
      
      console.log('HTML和纯文本已复制到剪贴板');
    } else {
      throw new Error('KaTeX未加载');
    }
  } finally {
    // 清理临时容器
    document.body.removeChild(tempContainer);
  }
};

