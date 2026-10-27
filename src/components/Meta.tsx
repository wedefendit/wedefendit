import Head from "next/head";
import JsonLdScript from "./JsonLdScript";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/og";

interface MetaProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  keywords?: string;
  canonical?: string;
  siteName?: string;
  noindex?: boolean;
  ogLocale?: string; // e.g. en_US
  themeColor?: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  structuredData?: Record<string, any>;
}

export const Meta = ({
  title = "Defend I.T. Solutions™",
  description = "Cybersecurity & I.T. Services in The Villages and Ocala",
  image,
  imageAlt = "Defend I.T. Solutions logo and tagline",
  url = `${SITE_URL}/`,
  keywords = "cybersecurity, IT support, Ocala, The Villages, Belleview, small business IT, home tech support, network security, computer repair, tech services, elderly scams, online safety",
  canonical,
  siteName = "Defend I.T. Solutions",
  noindex = false,
  ogLocale = "en_US",
  themeColor,
  structuredData,
}: MetaProps) => {
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  return (
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

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={siteName} />
    <meta property="og:locale" content={ogLocale} />
    <meta property="og:url" content={url} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:alt" content={imageAlt} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:secure_url" content={ogImage} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />
    <meta name="twitter:image:alt" content={imageAlt} />

    {structuredData && <JsonLdScript jsonLd={structuredData} />}
  </Head>
  );
};
