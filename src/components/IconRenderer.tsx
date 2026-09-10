import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { getFaviconUrl, getHostname } from '../utils/favicon';

interface IconRendererProps {
  name?: string;
  url?: string;
  className?: string;
  size?: number;
  fallbackText?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  name,
  url,
  className = 'w-6 h-6',
  size = 24,
  fallbackText,
}) => {
  const [attempt, setAttempt] = useState<number>(0);

  // 1. 如果有明确的外部或内联图片链接
  if (name && (name.startsWith('http://') || name.startsWith('https://') || name.startsWith('/') || name.startsWith('data:'))) {
    if (attempt > 0) {
      // 图片链接加载失败，尝试通过 url 解析或者降级
      if (url && attempt === 1) {
        const domain = getHostname(url);
        if (domain) {
          return (
            <img
              src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`}
              alt=""
              className={`${className} object-contain rounded-md`}
              onError={() => setAttempt(2)}
            />
          );
        }
      }
      const label = fallbackText || name || '★';
      return (
        <span className="font-semibold select-none flex items-center justify-center text-sm" style={{ fontSize: size * 0.55 }}>
          {label.slice(0, 1).toUpperCase()}
        </span>
      );
    }

    return (
      <img
        src={name}
        alt=""
        className={`${className} object-contain rounded-md`}
        onError={() => setAttempt(1)}
      />
    );
  }

  // 2. 如果 name 是除 'Globe' 之外的明确 Lucide 图标名
  if (name && name !== 'Globe' && !name.includes('.') && !name.includes('/') && !name.includes(':')) {
    const IconComponent = (LucideIcons as any)[name] || (LucideIcons as any)[capitalize(name)];
    if (IconComponent) {
      return <IconComponent className={className} size={size} />;
    }
  }

  // 3. 如果没有 logo (name 为空或为 'Globe')，只要有 url，就自动从互联网拉取高清网站 Favicon
  if (url) {
    const domain = getHostname(url);
    if (domain) {
      if (attempt === 0) {
        // 第一尝试源: favicon.im 高清聚合
        const primaryUrl = getFaviconUrl(url, 'favicon_im');
        return (
          <img
            src={primaryUrl}
            alt=""
            className={`${className} object-contain rounded-md`}
            onError={() => setAttempt(1)}
          />
        );
      } else if (attempt === 1) {
        // 第二尝试源: Google S2 图标全球节点
        const fallbackUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
        return (
          <img
            src={fallbackUrl}
            alt=""
            className={`${className} object-contain rounded-md`}
            onError={() => setAttempt(2)}
          />
        );
      } else if (attempt === 2) {
        // 第三尝试源: DuckDuckGo ICO 图标服务
        const ddgUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
        return (
          <img
            src={ddgUrl}
            alt=""
            className={`${className} object-contain rounded-md`}
            onError={() => setAttempt(3)}
          />
        );
      }
    }
  }

  // 4. 最终兜底使用首字母或首字
  const label = fallbackText || name || '★';
  return (
    <span className="font-semibold select-none flex items-center justify-center text-sm" style={{ fontSize: size * 0.55 }}>
      {label.slice(0, 1).toUpperCase()}
    </span>
  );
};

function capitalize(s: string) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
