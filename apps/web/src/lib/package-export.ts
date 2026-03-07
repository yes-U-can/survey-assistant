import { zipSync, strToU8 } from "fflate";

import type { PackageExportArtifacts } from "@/lib/package-dataset";

export function buildPackageExportZip(artifacts: PackageExportArtifacts) {
  const files: Record<string, Uint8Array> = {
    "00_package_overview.csv": strToU8(artifacts.overviewCsv),
    "01_attempts.csv": strToU8(artifacts.attemptsCsv),
    "02_codebook.csv": strToU8(artifacts.codebookCsv),
    "90_responses_long.csv": strToU8(artifacts.masterCsv),
  };

  for (const file of artifacts.templateWideCsvs) {
    files[file.fileName] = strToU8(file.content);
  }

  return zipSync(files, {
    level: 6,
  });
}
