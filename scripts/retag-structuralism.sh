#!/usr/bin/env bash
# THE MEASURE / SECTION MIGRATION Rev54
# Run from any directory; all filesystem paths resolve from the publication root.
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.."

if ! command -v jq >/dev/null 2>&1; then
  printf 'This migration requires jq for JSON-safe editing.\n' >&2
  exit 1
fi
if [[ ! -f manifest.json ]]; then
  printf 'manifest.json is missing from the publication root.\n' >&2
  exit 1
fi
if ! jq -e '.schema == "phi-labs.publication-manifest.v1" and .version == 1 and (.items | type) == "array"' manifest.json >/dev/null; then
  printf 'Unrecognized publication manifest. No files changed.\n' >&2
  exit 1
fi

files=(manifest.json)
for dir in articles galleries series; do
  [[ -d "$dir" ]] || continue
  while IFS= read -r -d '' file; do
    files+=("$file")
  done < <(find "$dir" -type f -name '*.json' -print0)
done

# Fail before modifying anything if a discovered JSON record cannot be parsed.
for file in "${files[@]}"; do
  if ! jq empty "$file"; then
    printf 'Invalid JSON in %s. No files changed.\n' "$file" >&2
    exit 1
  fi
done

legacy_query='
  def old_section: . == "science" or . == "humanities";
  def old_record:
    ((.section? | old_section)
     or any(.sections[]?; old_section)
     or (.category? == "Science" or .category? == "Humanities"));
  old_record or any(.items[]?; old_record)
'
retag_query='
  def canonical: if . == "science" or . == "humanities" then "structuralism" else . end;
  def distinct_in_order: reduce .[] as $s ([]; if index($s) == null then . + [$s] else . end);
  def retag:
    if type == "object" then
      (if (.section? | type) == "string" then .section |= canonical else . end)
      | (if (.sections? | type) == "array" then .sections |= (map(canonical) | distinct_in_order) else . end)
      | (if .category? == "Science" or .category? == "Humanities" then .category = "Structuralism" else . end)
    else . end;
  retag | (if (.items? | type) == "array" then .items |= map(retag) else . end)
'
changed=0
for file in "${files[@]}"; do
  if jq -e "$legacy_query" "$file" >/dev/null; then
    tmp=$(mktemp "${file}.retag.XXXXXX")
    if ! jq --indent 2 "$retag_query" "$file" > "$tmp"; then
      rm -f -- "$tmp"
      printf 'Could not rewrite %s.\n' "$file" >&2
      exit 1
    fi
    if cmp -s -- "$file" "$tmp"; then
      rm -f -- "$tmp"
      continue
    fi
    chmod --reference="$file" "$tmp"
    mv -- "$tmp" "$file"
    printf 'Retagged %s\n' "$file"
    changed=$((changed+1))
  fi
done
printf 'Finished: %d JSON file(s) updated. Re-running is safe.\n' "$changed"
