#!/bin/sh
# The Measure Rev55 — INTERNAL / PUBLIC DISCOURSE
# Run in The Measure website repository root: ./upgrade-measure-site.sh
# Modifies only website presentation, publication classification of one article,
# and generated archive/feed labels. Existing POLITICS source tags remain unchanged.

cult='phi-labs-is-not-a-cult-of-personality-please-stop-calling-us-that'
politics_primary='manufacturing-distraction-federal-elections-and-the-compute-cartel'

if ! command -v jq >/dev/null 2>&1; then
  echo 'ERROR: jq is required to preserve the publication manifest structure.' >&2
  exit 1
fi
for file in index.html manifest.json "articles/$cult.json" read/index.html "read/$cult/index.html" "read/$politics_primary/index.html" feed.xml feed-heavy.xml; do
  if [ ! -f "$file" ]; then
    echo "ERROR: missing website-root file: $file" >&2
    exit 1
  fi
done
if grep -Fq "id:'internal',name:'Internal'" index.html && grep -Fq "id === 'politics' ? 'public-discourse'" index.html; then
  echo 'The Measure Rev55 classification migration is already installed; no further changes.'
  exit 0
fi
if ! grep -F "const canonicalSectionId = id =>" index.html; then
  echo 'ERROR: expected section router not found; no files changed.' >&2
  exit 1
fi
if ! grep -F "{id:'politics',name:'Politics',summary:" index.html && ! grep -F "{id:'public-discourse',name:'Public Discourse',summary:" index.html; then
  echo 'ERROR: expected section registry not found; no files changed.' >&2
  exit 1
fi
if [ "$(jq --arg id "$cult" '[.items[] | select(.id==$id)] | length' manifest.json)" != 1 ]; then
  echo 'ERROR: the denial article must occur exactly once in manifest.json.' >&2
  exit 1
fi
if [ "$(jq -r .id "articles/$cult.json")" != "$cult" ]; then
  echo 'ERROR: article JSON ID does not match its stable slug.' >&2
  exit 1
fi

stage=$(mktemp -d './.measure-rev55.XXXXXXXX') || exit 1
trap 'rm -rf -- "$stage"' 0
trap 'exit 1' 1 2 3 15
mkdir -p "$stage/articles" "$stage/read/$cult" "$stage/read/$politics_primary" || exit 1

sed \
  -e "s|{id:'politics',name:'Politics',summary:'Institutions, governance, policy and civic life.'},|{id:'public-discourse',name:'Public Discourse',summary:'Institutions, governance, policy and civic life.'}, {id:'internal',name:'Internal',summary:'The organizational record: proceedings, staff affairs, decisions and accountability at Phi Labs Research.'},|" \
  -e "/const canonicalSectionId = /s| : id;| : id === 'politics' ? 'public-discourse' : id;|" \
  -e 's|Technology\. Structuralism\. Politics\. Curiosities\. Special Reports\.|Technology. Structuralism. Public Discourse. Internal. Curiosities. Special Reports.|g' \
  index.html > "$stage/index.html" || exit 1

jq --arg id "$cult" '(.items[] | select(.id==$id)) |= (.section="internal" | .sections=["internal","breaking"])' manifest.json > "$stage/manifest.json" || exit 1
jq '.section="internal" | .sections=["internal","breaking"]' "articles/$cult.json" > "$stage/articles/$cult.json" || exit 1

# Legacy political identifiers are source metadata. Only rendered classifications change.
awk -v id="$cult" '
  {
    if (index($0, "read/" id "/") > 0) sub(/ \/ HUMANITIES \/ /," / INTERNAL / ");
    gsub(/ \/ POLITICS \/ /," / PUBLIC DISCOURSE / ");
    print;
  }
' read/index.html > "$stage/read/index.html" || exit 1
sed 's|HUMANITIES / COPY / THE MEASURE|INTERNAL / COPY / THE MEASURE|g' \
  "read/$cult/index.html" > "$stage/read/$cult/index.html" || exit 1
sed 's|POLITICS / EXPLAINER / THE MEASURE|PUBLIC DISCOURSE / EXPLAINER / THE MEASURE|g' \
  "read/$politics_primary/index.html" > "$stage/read/$politics_primary/index.html" || exit 1

for feed in feed.xml feed-heavy.xml; do
  awk -v id="$cult" '
    /<item>/ {is_cult=0}
    {
      if (index($0,"/read/" id "/") > 0) is_cult=1;
      if (is_cult) gsub(/<category>humanities<\/category>/,"<category>internal</category>");
      gsub(/<category>politics<\/category>/,"<category>public-discourse</category>");
      gsub(/Science, technology, humanities, politics, and Special Reports from Phi Labs\./,"Science, technology, humanities, public discourse, INTERNAL, and Special Reports from Phi Labs.");
      print;
    }
  ' "$feed" > "$stage/$feed" || exit 1
done

if ! grep -F "id:'internal',name:'Internal'" "$stage/index.html"; then
  echo 'ERROR: INTERNAL registration failed; no files changed.' >&2
  exit 1
fi
if ! grep -F "id === 'politics' ? 'public-discourse'" "$stage/index.html"; then
  echo 'ERROR: POLITICS legacy routing failed; no files changed.' >&2
  exit 1
fi
if [ "$(jq --arg id "$cult" -r '.items[] | select(.id==$id) | .section' "$stage/manifest.json")" != internal ]; then
  echo 'ERROR: historical precursor classification failed; no files changed.' >&2
  exit 1
fi
if [ "$(jq -r '[.items[] | select(.section=="politics" or (.sections//[] | index("politics")!=null))] | length' "$stage/manifest.json")" != "$(jq -r '[.items[] | select(.section=="politics" or (.sections//[] | index("politics")!=null))] | length' manifest.json)" ]; then
  echo 'ERROR: legacy POLITICS source tags unexpectedly changed; no files changed.' >&2
  exit 1
fi

for file in index.html manifest.json "articles/$cult.json" read/index.html "read/$cult/index.html" "read/$politics_primary/index.html" feed.xml feed-heavy.xml; do
  mv -v -- "$stage/$file" "$file" || { echo "ERROR: unable to install $file" >&2; exit 1; }
done
printf '%s\n' 'THE MEASURE REV55 COMPLETE: INTERNAL added; POLITICS routed to Public Discourse; one article migrated; source identifiers/dates/URLs retained.'
printf '%s\n' 'Publish the pending LCP announcement using SNIPE 0.3.7.18 when this website revision goes live.'
