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

import {
  makeGetStaticSlugProps,
  type IndividualServiceSlugProps,
  getStaticPathsForServices,
} from "@/lib/service-page";
import { ServiceSlug } from "@/components/Service";
import type { GetStaticPaths, GetStaticProps } from "next";

export const getStaticPaths: GetStaticPaths = getStaticPathsForServices;
export const getStaticProps: GetStaticProps = makeGetStaticSlugProps();

export default function IndividualServicePage({
  service,
  related,
}: IndividualServiceSlugProps) {
  return <ServiceSlug service={service} related={related} />;
}
