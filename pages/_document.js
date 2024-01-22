import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import theme from "../theme";

export default class MyDocument extends Document {

  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
     
          <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
          <meta name="title" content="Shepventures" />
          <meta name="description" content="Let's go on a Shepventure -- an RPG adventure on the Algorand Blockchain" />
          <meta name="keywords" content="Shepventures, Idle Game, NFT, Algorand"/>

          <meta name="theme-color" content={theme.palette.primary.main} />

          
          
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />

          <link rel="icon" href="/images/favicon.ico"/>
          <link rel="shortcut icon" href="/images/favicon.ico"/>

          
          
        </Head>
        <body>

          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

