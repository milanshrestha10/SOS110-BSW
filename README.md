READ Me file 
Sample

## Search engines

Every page carries `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">` and the repo has a `robots.txt` that disallows all crawlers. Add the same meta tag to every new page. Note: crawlers only read `robots.txt` at the domain root, so the meta tag is what protects these pages on GitHub Pages.
