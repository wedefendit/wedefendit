/*
Copyright © 2026 Defend I.T. Solutions LLC. All Rights Reserved.

This software and its source code are the proprietary property of
Defend I.T. Solutions LLC and are protected by United States and
international copyright laws. Unauthorized reproduction, distribution,
modification, display, or use of this software, in whole or in part, without the
prior written permission of Defend I.T. Solutions LLC, is strictly prohibited.

This software is provided for use only by authorized employees, contractors, or
licensees of Defend I.T. Solutions LLC and may not be disclosed to any third
party without express written consent.
*/
import Head from "next/head";
import JsonLdScript from "./JsonLdScript";

interface MetaProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  keywords?: string;
  canonical?: string;
  siteName?: string;
  twitterSite?: string; // e.g. @wedefendit
  noindex?: boolean;
  ogLocale?: string; // e.g. en_US
  themeColor?: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  structuredData?: Record<string, any>;
}

export const Meta = ({
  title = "Defend I.T. Solutions™",
  description = "Cybersecurity & I.T. Services in The Villages and Ocala",
  image = "https://www.wedefendit.com/og-image.png",
  imageAlt = "Defend I.T. Solutions logo and tagline",
  url = "https://www.wedefendit.com/",
  keywords = "cybersecurity, IT support, Ocala, The Villages, Belleview, small business IT, home tech support, network security, computer repair, tech services, elderly scams, online safety",
  canonical,
  siteName = "Defend I.T. Solutions",
  noindex = false,
  ogLocale = "en_US",
  themeColor,
  structuredData,
}: MetaProps) => (
  <Head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta
      name="robots"
      content={noindex ? "noindex, nofollow" : "index, follow"}
    />
    <meta name="author" content="Defend I.T. Solutions LLC" />
    <meta name="keywords" content={keywords} />
    {themeColor && <meta name="theme-color" content={themeColor} />}

    <link rel="canonical" href={canonical || url} />

    {/* Open Graph */}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={siteName} />
    <meta property="og:locale" content={ogLocale} />
    <meta property="og:url" content={url} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="og:image:alt" content={imageAlt} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:secure_url" content={image} />

    {/* Twitter */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
    <meta name="twitter:image:alt" content={imageAlt} />

    {/* JSON-LD */}
    {structuredData && <JsonLdScript jsonLd={structuredData} />}
  </Head>
);
