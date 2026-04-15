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

import fs from "fs";
import path from "path";
import type { GetStaticPaths, GetStaticProps } from "next";
import { ServiceSlug, ServiceSlugProps } from "@/components";

const REMOTE_DIR = path.join(process.cwd(), "data/services/remote/services");

// helper: load one remote service JSON
function readRemoteJson(filePath: string) {
  const fileContents = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileContents);
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(REMOTE_DIR);
  const paths = files
    .filter((f) => f.endsWith(".json"))
    .map((file) => ({ params: { slug: file.replace(".json", "") } }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = String(params?.slug || "");
  const filePath = path.join(REMOTE_DIR, `${slug}.json`);

  if (!fs.existsSync(filePath)) return { notFound: true };

  // current service
  const service = readRemoteJson(filePath);

  // build "related" from the same folder (other remote services)
  const files = fs.readdirSync(REMOTE_DIR).filter((f) => f.endsWith(".json"));
  const related = files
    .map((f) => f.replace(".json", ""))
    .filter((s) => s !== slug)
    .slice(0, 3)
    .map((s) => {
      const p = path.join(REMOTE_DIR, `${s}.json`);
      const svc = readRemoteJson(p);
      // expects each JSON to have a .title; if not, fallback to slug
      return { label: (svc.title as string) || s, slug: s };
    });

  return { props: { service, related } };
};

// Accept extra prop locally without touching your imported type
type PageProps = ServiceSlugProps & {
  related?: { label: string; slug: string }[];
};

export default function RemoteServicePage({ service, related }: PageProps) {
  return <ServiceSlug service={service} remote related={related} />;
}
