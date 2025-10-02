import React, { useEffect, useRef } from 'react';

interface TeXProps {
  children: string;
  block?: boolean;
  className?: string;
}

export const TeX: React.FC<TeXProps> = ({ children, block = false, className }) => {
  const renderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!renderRef.current) return;

    try {
      // 检查KaTeX是否可用
      if (typeof (window as any).katex === 'undefined') {
        renderRef.current.innerHTML = '<div class="error-message">KaTeX未加载</div>';
        return;
      }

      // 清空之前的内容
      renderRef.current.innerHTML = '';

      // 使用原生KaTeX API渲染
      (window as any).katex.render(children, renderRef.current, {
        throwOnError: false,
        trust: true,
        strict: false,
        displayMode: block
      });
    } catch (error) {
      console.error('TeX渲染错误:', error);
      renderRef.current.innerHTML = '<div class="error-message">渲染错误</div>';
    }
  }, [children, block]);

  return (
    <div 
      ref={renderRef} 
      className={className}
      style={{ 
        display: block ? 'block' : 'inline',
        textAlign: block ? 'center' : 'left'
      }}
    />
  );
};
