import { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                min-height: 100%;
                scrollbar-gutter: stable;
                background: #0f172a;
              }

              body {
                overflow-y: scroll;
              }

              #root, #expo-root, [data-expo-root] {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                background: #0f172a;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
