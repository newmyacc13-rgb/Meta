#!/usr/bin/env python3
"""Validate the complete static link graph, fragment targets, and corpus isolation."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT/'site'


class Document(HTMLParser):
    def __init__(self,path):
        super().__init__()
        self.ids = set()
        self.links = []
        self.errors = []
        self.feed(path.read_text())

    def handle_starttag(self,tag,attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                self.errors.append('Duplicate id: '+attrs['id'])
            self.ids.add(attrs['id'])
        for key in ('href','src'):
            if attrs.get(key):
                self.links.append(attrs[key])


def main():
    documents = {p:Document(p) for p in SITE.rglob('*.html')}
    errors = []
    count = 0
    for path,doc in documents.items():
        errors.extend(f'{path.name}: {error}' for error in doc.errors)
        for link in doc.links:
            parsed = urlsplit(link)
            if parsed.scheme or parsed.netloc:
                continue
            target = (path.parent/unquote(parsed.path)).resolve() if parsed.path else path
            if not target.is_relative_to(SITE):
                errors.append(f'{path.name}: link escapes public root: {link}')
                continue
            if not target.is_file():
                errors.append(f'{path.name}: missing target {link}')
            elif parsed.fragment and target in documents and unquote(parsed.fragment) not in documents[target].ids:
                errors.append(f'{path.name}: missing anchor {link}')
            count += 1
    index = json.loads((SITE/'search-index.json').read_text())
    assert len(index) == 8
    for entry in index:
        assert (SITE/entry['path']).is_file()
    assert len(documents) == 12
    assert not (SITE/'evaluation').exists()
    if errors:
        print('\n'.join(errors),file=sys.stderr)
        return 1
    print(f'PASS: {len(documents)} pages, {count} local links/assets/anchors, 8 search entries; evaluator remains outside public root.')
    return 0


if __name__=='__main__':
    sys.exit(main())
