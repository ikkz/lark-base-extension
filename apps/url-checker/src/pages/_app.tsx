import '@/styles/globals.css';
import '@/i18n';
import type { AppProps } from 'next/app';
import { ConfigProvider } from 'antd';
import { StyleProvider } from '@ant-design/cssinjs';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider>
      <StyleProvider hashPriority="high">
        <Component {...pageProps} />
      </StyleProvider>
    </ConfigProvider>
  );
}
